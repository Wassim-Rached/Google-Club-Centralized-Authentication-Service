export function reformatPemKey(keyString: string, isPublicKey = true) {
  // Define the key headers and footers
  const header = isPublicKey
    ? "-----BEGIN PUBLIC KEY-----"
    : "-----BEGIN RSA PRIVATE KEY-----";
  const footer = isPublicKey
    ? "-----END PUBLIC KEY-----"
    : "-----END RSA PRIVATE KEY-----";

  // Check if the key starts with the correct header and ends with the correct footer
  if (!keyString.startsWith(header) || !keyString.endsWith(footer)) {
    throw new Error("Invalid PEM format.");
  }

  // Remove the header and footer
  const body = keyString.replace(header, "").replace(footer, "").trim();

  // Remove any additional spaces and line breaks
  const formattedBody = body.replace(/\s+/g, "");

  // Add line breaks for the Base64 encoded body
  const chunkSize = 64; // Standard chunk size for PEM files
  let formattedKey = header + "\n";
  for (let i = 0; i < formattedBody.length; i += chunkSize) {
    formattedKey += formattedBody.slice(i, i + chunkSize) + "\n";
  }
  formattedKey += footer;

  return formattedKey;
}
