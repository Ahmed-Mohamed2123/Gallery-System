import * as fs from "fs";
import { PathLike } from "fs";
import { FileHandle } from "fs/promises";

export class FileOperation {
  static async deleteFile(filePath: string) {
    try {
      await fs.promises.access(`.${filePath}`, fs.constants.F_OK);
      return fs.promises.unlink(`.${filePath}`);
    } catch (err) {
      throw new Error("Something wrong happened");
    }
  }

  static async writeFile(file: PathLike | FileHandle, content: string) {
    try {
      await fs.promises.writeFile(file, content);
      console.log("The file has been deleted successfully");
    } catch (err) {
      throw new Error("Something wrong happened");
    }
  }
}