import JSZip from 'jszip';


const hasData = (image: HTMLImageElement) => {
  // TODO better way to do this?
  return image.width && image.height;
};

/**
 * @private
 */
const _zeroPad = (string: string, length: number) => {
  while (string.length < length) {
    string = `0${string}`;
  }
  return string;
};

const rgb2hex = (r: number, g: number, b: number) => `#${_zeroPad(r.toString(16), 2)}${_zeroPad(g.toString(16), 2)}${_zeroPad(b.toString(16), 2)}`;

/**
 * @param hex e.g. '#abcdef'
 * @return [r, g, b, 255]
 */
const hex2rgba = (hex: string): number[] => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b, 255];
};

/**
 * @param {HTMLImageElement} image
 * @param {Object} colorMap A map of (hex => hex) OR (hex => [r, g, b, a])
 * @return
 */
const replaceColors = async (image: HTMLImageElement, colorMap: Record<string, string | number[]>): Promise<HTMLImageElement> => {
  const t1 = new Date().getTime();
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    const rgbaSwaps = Object.entries(colorMap)
      .map(([source, dest]) => [hex2rgba(source), dest[0] === '#' ? hex2rgba(dest as string) : dest as number[]]);

    for (let i = 0; i < imageData.data.length; i += 4) {
      for (let j = 0; j < rgbaSwaps.length; j++) {
        const [source, dest] = rgbaSwaps[j];
        if ([0, 1, 2, 3].every(j => (imageData.data[i + j] === source[j]))) {
          [0, 1, 2, 3].forEach(j => {
            imageData.data[i + j] = dest[j];
          });
          break;
        }
      }
    }
    context.putImageData(imageData, 0, 0);

    const swappedImage = document.createElement('img');
    swappedImage.src = canvas.toDataURL('image/png');
    swappedImage.onload = () => {
      const t2 = new Date().getTime();
      resolve(swappedImage);
    };
  });
};

/**
 * Apparently we can't directly compare src vs. data-behind because src can have file:/// prepended to it.
 */
const isBehind = (image: HTMLImageElement): boolean => {
  if (!image.getAttribute('data-behind')) {
    return false;
  }
  const srcParts = image.src.split('/');
  const behindParts = image.getAttribute('data-behind')?.split('/');
  return behindParts && (srcParts[srcParts.length - 1] === behindParts[behindParts.length - 1]) || false;
};

const comparing = <T,U> (keyFunction: (t: T) => number) => ((a: T, b: T) => keyFunction(a) - keyFunction(b));

const generateDownloadLink = async (filenameToBlob: Record<string, string>): Promise<string> => {
  const zip = new JSZip();
  Object.entries(filenameToBlob).forEach(([filename, blob]) =>{
    zip.file(filename, blob, { base64: true });
  });
  return zip.generateAsync({ type: 'base64' });
};

/**
 * TODO: Assumes that any one frame will have all the colors for every animation.
 */
const getImageColors = (image: HTMLImageElement): string[] => {
  const colors: Record<string, string> = {};
  const tmpCanvas = document.createElement('canvas');
  const tmpContext = tmpCanvas.getContext('2d') as CanvasRenderingContext2D;
  tmpCanvas.width = image.width;
  tmpCanvas.height = image.height;
  tmpContext.drawImage(image, 0, 0);
  const imageData = tmpContext.getImageData(0, 0, tmpCanvas.width, tmpCanvas.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const [r, g, b, a] = imageData.data.slice(i, i + 4);
    const hex = rgb2hex(r, g, b);
    colors[hex] = hex;
  }
  return Object.values(colors);
};

const arrayEquals = (first: any[], second: any[]) => {
  return (
    first.every(e => second.indexOf(e) > -1)
    && second.every(e => first.indexOf(e) > -1)
  );
};

/**
 * Still pretty shallow
 */
const objectEquals = (first: any, second: any) => {
  return (
    Object.entries(first).every(([k, v]) => second[k] === v)
    && Object.entries(second).every(([k, v]) => first[k] === v)
  );
};

export {
  hasData,
  replaceColors,
  isBehind,
  comparing,
  generateDownloadLink,
  getImageColors,
  rgb2hex,
  hex2rgba,
  arrayEquals,
  objectEquals
};
