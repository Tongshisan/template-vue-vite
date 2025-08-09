/**
 * 读取文件的文本内容。
 * @param {File | Blob} file 要读取的文件。
 * @returns {Promise<string>} 文件文本内容。
 */
export function readFileAsText(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader: FileReader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target) {
          resolve(e.target.result as string);
        } else {
          reject(new Error("No FileReader result found"));
        }
      };
      reader.readAsText(file);
    } catch (err) {
      reject(err);
    }
  });
}
