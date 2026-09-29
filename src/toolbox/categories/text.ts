/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: AGPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category, textShadow } from "../builder";

export const textCategory = category("CAT_TEXT", {
  style: "text_category",
  icon: "fa-quote-left"
}, [
  block("text"),
  block("text_multiline", {
    fields: {
      "TEXT": "µc\nblockly"
    }
  }),
  block("text_char"),
  block("text_no_quote"),
  block("text_date"),
  block("text_join"),
  block("text_append", {
    inputs: {
      "TEXT": textShadow("")
    }
  }),
  block("text_length"),
  block("text_isEmpty", {
    inputs: {
      "VALUE": textShadow("")
    }
  }),
  block("text_indexOf", {
    inputs: {
      "VALUE": textShadow("abc"),
      "FIND": textShadow("abc")
    }
  }),
  block("text_charAt", {
    inputs: {
      "VALUE": textShadow("abc")
    }
  }),
  block("text_getSubstring", {
    inputs: {
      "STRING": textShadow("abc")
    }
  }),
  block("text_changeCase", {
    inputs: {
      "TEXT": textShadow("abc")
    }
  }),
  block("text_trim", {
    inputs: {
      "TEXT": textShadow("abc")
    }
  }),
  block("text_print", {
    inputs: {
      "TEXT": {
        "shadow": {
          "type": "text"
        }
      }
    }
  }),
  block("text_prompt_ext", {
    inputs: {
      "TEXT": {
        "shadow": {
          "type": "text"
        }
      }
    }
  }),
  block("text_count", {
    inputs: {
      "SUB": {
        "shadow": {
          "type": "text"
        }
      },
      "TEXT": {
        "shadow": {
          "type": "text"
        }
      }
    }
  }),
  block("text_replace", {
    inputs: {
      "FROM": {
        "shadow": {
          "type": "text"
        }
      },
      "TO": {
        "shadow": {
          "type": "text"
        }
      },
      "TEXT": {
        "shadow": {
          "type": "text"
        }
      }
    }
  }),
  block("text_reverse")
]);
