module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "refactor",
        "perf",
        "docs",
        "style",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-enum": [
      2,
      "always",
      ["frontend", "backend", "auth", "api", "db", "ui", "config", "ci"],
    ],
    "scope-empty": [2, "never"],

    // Sujet
    "subject-empty": [2, "never"],
    "subject-case": [2, "always", ["lower-case"]],
    "subject-full-stop": [2, "never", "."],

    // Longueur
    "header-max-length": [2, "always", 100],

    // Body (optionnel mais propre)
    "body-leading-blank": [1, "always"],
    "footer-leading-blank": [1, "always"],
  },
};
