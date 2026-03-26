import { expect, test, describe } from "bun:test";
import { encryptData, decryptData, textToBytes, bytesToText } from "./pi-engine";

describe("pi-engine", () => {
  const testCases = [
    { text: "Hello, Pi!", offset: 12345 },
    { text: "A", offset: 1 },
    { text: "", offset: 0 },
    { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(10), offset: 999999 },
    { text: "Special characters: !@#$%^&*()_+{}[]:;\"'\\|<>,.?/~`", offset: 42 }
  ];

  testCases.forEach(({ text, offset }) => {
    test(`decryptData should reverse encryptData for text: "${text.substring(0, 20)}${text.length > 20 ? '...' : ''}" with offset: ${offset}`, () => {
      const originalBytes = textToBytes(text);
      const encryptedBytes = encryptData(originalBytes, offset);
      const decryptedBytes = decryptData(encryptedBytes, offset);
      const decryptedText = bytesToText(decryptedBytes);

      expect(decryptedText).toBe(text);
      expect(decryptedBytes).toEqual(originalBytes);
    });
  });

  test("decryptData with wrong offset should not return original text", () => {
    const originalText = "Secret Message";
    const keyOffset = 12345;
    const wrongOffset = 12346; // Very close but different

    const originalBytes = textToBytes(originalText);
    const encryptedBytes = encryptData(originalBytes, keyOffset);
    const decryptedBytes = decryptData(encryptedBytes, wrongOffset);
    const decryptedText = bytesToText(decryptedBytes);

    expect(decryptedText).not.toBe(originalText);
  });

  test("encrypting twice with same key should return original data (XOR property)", () => {
    const originalText = "XOR is self-inverse";
    const keyOffset = 98765;

    const originalBytes = textToBytes(originalText);
    const encryptedOnce = encryptData(originalBytes, keyOffset);
    const encryptedTwice = encryptData(encryptedOnce, keyOffset);

    expect(bytesToText(encryptedTwice)).toBe(originalText);
  });

  test("decryptData should be equivalent to encryptData", () => {
    const data = textToBytes("Test data");
    const offset = 777;

    const encrypted = encryptData(data, offset);
    const decrypted = decryptData(data, offset);

    expect(decrypted).toEqual(encrypted);
  });
});
