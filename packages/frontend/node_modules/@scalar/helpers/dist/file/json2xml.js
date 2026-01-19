function json2xml(data, options = {}) {
  const { indent = "  ", format = true, xmlDeclaration = true } = options;
  const toXml = (value, key, currentIndent) => {
    let xml2 = "";
    if (Array.isArray(value)) {
      for (let i = 0, n = value.length; i < n; i++) {
        xml2 += toXml(value[i], key, currentIndent);
      }
    } else if (typeof value === "object" && value !== null) {
      let hasChild = false;
      let attributes = "";
      let children = "";
      for (const attr in value) {
        if (attr.charAt(0) === "@") {
          attributes += " " + attr.substr(1) + '="' + value[attr].toString() + '"';
        }
      }
      for (const child in value) {
        if (child === "#text") {
          children += value[child];
        } else if (child === "#cdata") {
          children += "<![CDATA[" + value[child] + "]]>";
        } else if (child.charAt(0) !== "@") {
          hasChild = true;
          children += toXml(value[child], child, currentIndent + indent);
        }
      }
      if (hasChild) {
        xml2 += currentIndent + "<" + key + attributes + ">\n";
        xml2 += children;
        xml2 += currentIndent + "</" + key + ">\n";
      } else {
        xml2 += currentIndent + "<" + key + attributes + "/>\n";
      }
    } else {
      xml2 += currentIndent + "<" + key + ">" + (value?.toString() || "") + "</" + key + ">\n";
    }
    return xml2;
  };
  let xml = "";
  if (xmlDeclaration) {
    xml += '<?xml version="1.0" encoding="UTF-8"?>';
    if (format) {
      xml += "\n";
    }
  }
  for (const key in data) {
    if (Object.hasOwn(data, key)) {
      xml += toXml(data[key], key, "");
    }
  }
  if (format) {
    return xml.trim();
  }
  return xml.replace(/\n/g, "").replace(/>\s+</g, "><").trim();
}
export {
  json2xml
};
//# sourceMappingURL=json2xml.js.map
