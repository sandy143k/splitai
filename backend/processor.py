import torch
import torchaudio
from pathlib import Path


class AudioProcessor:
    MODEL_NAME = "htdemucs"
    _model = None

    def _load_model(self):
        if self._model is None:
            print(f"[Processor] Loading {self.MODEL_NAME}...")
            from demucs import pretrained
            self._model = pretrained.get_model(self.MODEL_NAME)
            self._model.eval()
            if torch.cuda.is_available():
                self._model.cuda()
                print("[Processor] GPU detected")
            else:
                print("[Processor] Running on CPU")
        return self._model

    def separate(self, input_path: str, output_dir: str, progress_cb=None):
        if progress_cb: progress_cb(15)
        model = self._load_model()
        device = "cuda" if torch.cuda.is_available() else "cpu"

        waveform, sr = torchaudio.load(input_path)
        if waveform.shape[0] == 1:
            waveform = waveform.repeat(2, 1)

        target_sr = model.samplerate
        if sr != target_sr:
            waveform = torchaudio.transforms.Resample(sr, target_sr)(waveform)

        if progress_cb: progress_cb(30)

        waveform = waveform.unsqueeze(0).to(device)
        with torch.no_grad():
            from demucs.apply import apply_model
            sources = apply_model(
                model, waveform,
                device=device, shifts=1,
                split=True, overlap=0.25, progress=False
            )
        sources = sources.squeeze(0).cpu()

        if progress_cb: progress_cb(80)

        stem_names = model.sources
        stem_map   = {name: sources[i] for i, name in enumerate(stem_names)}
        vocals      = stem_map["vocals"]
        instrumental = sum(stem_map[k] for k in stem_names if k != "vocals")

        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)
        torchaudio.save(str(out / "vocals.wav"),       vocals,       target_sr)
        torchaudio.save(str(out / "instrumental.wav"), instrumental, target_sr)

        if progress_cb: progress_cb(95)
        return {"vocals": str(out / "vocals.wav"), "instrumental": str(out / "instrumental.wav")}
