# Third-party engines

## EvoAgentX

- Version: 0.1.4
- Source: https://github.com/ANative-Lab/EvoAgentX
- License: MIT
- Role in Sayuri: agent workflow generation, evaluation and supervised evolution.
- Heavy optimizer extras run only in the isolated `.venv-evolution` environment.

## OpenCog Hyperon / MeTTa

- Version: 0.2.10
- Source: https://github.com/trueagi-io/hyperon-experimental
- License: MIT
- Role in Sayuri: symbolic logic and knowledge reasoning.

## MemRL

- Package version: 0.1.0
- Pinned revision: c1b322ca43de36ddf64c6712f89d0095bfc35ce0
- Source: https://github.com/MemTensor/MemRL
- License: MIT
- Role in Sayuri: episodic runtime reinforcement learning over verified experience.
- Runtime: installed in a dedicated `.venv-memrl` environment.
- The normal Sayuri Core records MemRL-compatible reward episodes in shadow mode without importing MemRL.

MemRL and the full EvoAgentX optimizer stack are intentionally isolated because their current transitive OpenAI SDK requirements are incompatible in one Python environment.

Third-party engines are installed as external Python dependencies. Their source trees are not vendored into SAYURI BEYOND.
