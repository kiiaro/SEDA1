import { Platform } from 'react-native';
import { computeCanvasCropPlan } from './avatarCropUtils';

export interface LoadedPhotoDraft {
  dataUrl: string;
  width: number;
  height: number;
}

export function loadPhotoDimensionsWeb(dataUrl: string): Promise<LoadedPhotoDraft> {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      reject(new Error('Formatação de foto disponível na versão web.'));
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      resolve({
        dataUrl,
        width: img.naturalWidth || img.width || 256,
        height: img.naturalHeight || img.height || 256,
      });
    };
    img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
    img.src = dataUrl;
  });
}

export function pickRawImageWeb(
  onLoaded: (photo: LoadedPhotoDraft) => void,
  onError?: (msg: string) => void
): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    onError?.('Seleção de foto disponível na versão web.');
    return;
  }

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/jpeg,image/webp,image/gif';

  input.onchange = () => {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      onError?.('Escolha uma imagem com até 5 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const rawUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawUrl) {
        onError?.('Não foi possível ler a imagem.');
        return;
      }
      try {
        const loaded = await loadPhotoDimensionsWeb(rawUrl);
        onLoaded(loaded);
      } catch (err) {
        onError?.(err instanceof Error ? err.message : 'Arquivo de imagem inválido.');
      }
    };
    reader.onerror = () => onError?.('Erro ao abrir o arquivo.');
    reader.readAsDataURL(file);
  };

  input.click();
}

export async function renderCroppedAvatarWeb(
  sourceUrl: string,
  options: {
    naturalWidth: number;
    naturalHeight: number;
    rotationDeg: number;
    zoom: number;
    panX: number;
    panY: number;
    viewportSize: number;
    outputSize?: number;
  }
): Promise<string> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return sourceUrl;
  }
  const outputSize = options.outputSize ?? 256;

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível processar a imagem.'));
    image.src = sourceUrl;
  });

  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) return sourceUrl;

  const plan = computeCanvasCropPlan({
    naturalWidth: options.naturalWidth || img.naturalWidth || img.width,
    naturalHeight: options.naturalHeight || img.naturalHeight || img.height,
    rotationDeg: options.rotationDeg,
    zoom: options.zoom,
    panX: options.panX,
    panY: options.panY,
    viewportSize: options.viewportSize,
    outputSize,
  });

  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.translate(plan.translateX, plan.translateY);
  ctx.rotate(plan.rotationRad);
  ctx.drawImage(
    img,
    -plan.drawWidth / 2,
    -plan.drawHeight / 2,
    plan.drawWidth,
    plan.drawHeight
  );
  ctx.restore();

  try {
    return canvas.toDataURL('image/jpeg', 0.88);
  } catch {
    return sourceUrl;
  }
}

export function pickProfilePhotoWeb(
  onSelected: (dataUrl: string) => void,
  onError?: (msg: string) => void
): void {
  pickRawImageWeb(async (loaded) => {
    try {
      const cropped = await renderCroppedAvatarWeb(loaded.dataUrl, {
        naturalWidth: loaded.width,
        naturalHeight: loaded.height,
        rotationDeg: 0,
        zoom: 1,
        panX: 0,
        panY: 0,
        viewportSize: 240,
        outputSize: 256,
      });
      onSelected(cropped);
    } catch {
      onSelected(loaded.dataUrl);
    }
  }, onError);
}
