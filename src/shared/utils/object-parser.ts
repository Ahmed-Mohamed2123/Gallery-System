export class ObjectParser {
  static parseValuesToFloat(object: Record<string, any>) {
    let parsedData: Record<string, any> = {};
    Object.entries(object).map(([key, value]) => parsedData[key] = parseFloat(value));

    return parsedData;
  }
}