<div align="center">
  <a href="https://github.com/TinyActive/OpenVpn-Panel">
    <img width="150px" src="./docs/images/logo.png" alt="OV-Panel Logo">
  </a>

  # **OV-Panel — Fork & Continued**
  A maintained continuation of the OV-Panel project for managing OpenVPN servers and users.

  <p align="center">
    <a href="https://primezdev.github.io/ov-doc/" target="_blank">
      <img alt="Documentation" src="https://img.shields.io/badge/Documentation-Original-brightgreen?style=for-the-badge&logo=readthedocs" />
    </a>
  </p>
</div>

![OV-Panel Screenshot](docs/images/panel.png)

---

## A note of thanks

This repository is based on the original OV-Panel project by primeZdev (https://github.com/primeZdev/ov-panel).
Huge thanks to the original author and contributors for creating the first implementation and the documentation.

This repository (TinyActive/OpenVpn-Panel) builds on that foundation and includes numerous updates, fixes, and improvements. If you used or liked the original project, thank you — your work made this possible.

---

## What this fork means

- Source: This project was originally forked from primeZdev/ov-panel.
- Purpose: To continue maintenance, apply bug fixes, modernize dependencies, and introduce incremental improvements to both backend and frontend.
- Status: Actively maintained by the TinyActive team. Check the commit history for detailed change information.

---

## Highlights of recent work

This fork focuses on pragmatic improvements rather than a complete rewrite. Typical updates include:

- Dependency updates and security-related fixes
- Bug fixes and performance improvements in backend services
- Frontend refinements, translations, and usability improvements (see `frontend/src`)
- Better packaging and installer scripts for easier deployments

For a full list of changes, review the repository history (commits) and issue tracker.

---

## Quick start

The repository contains both the backend and frontend. See `backend/` and `frontend/` for source code.

- To review or run the included installer (on a Linux host):

```bash
bash install.sh
```

- For manual setup, inspect `backend/app.py`, `frontend/` and `installer.py` for configuration and bootstrap steps.

---

## Documentation

The original documentation is still a very useful resource:

- Original docs: https://primezdev.github.io/ov-doc/

If you find anything missing or a step that no longer applies, please open an issue or a pull request — contributions are welcome.

---

## License

This project inherits the license from the original repository. See the `LICENSE` file for details.

---

Thank you to everyone who contributed to the original project — this fork exists because of your work.
