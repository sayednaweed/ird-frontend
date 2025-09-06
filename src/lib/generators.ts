export const generatePassword = () => {
  let generatedPassword = "";
  const lowerCaseLetters = "abcdefghijklmnopqrstuvwxyz";
  const upperCaseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const specialChars = "!@#$%^&*()-_=+";

  // Ensuring the password has at least one of each required character
  generatedPassword +=
    lowerCaseLetters[Math.floor(Math.random() * lowerCaseLetters.length)];
  generatedPassword +=
    upperCaseLetters[Math.floor(Math.random() * upperCaseLetters.length)];
  generatedPassword += numbers[Math.floor(Math.random() * numbers.length)];

  // Filling the remaining length with random characters
  const allCharacters =
    lowerCaseLetters + upperCaseLetters + numbers + specialChars;
  while (generatedPassword.length < 8) {
    generatedPassword +=
      allCharacters[Math.floor(Math.random() * allCharacters.length)];
  }

  // Shuffle the password to avoid predictable patterns
  generatedPassword = generatedPassword
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");

  return generatedPassword;
};
