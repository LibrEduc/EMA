/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
 * SPDX-License-Identifier: GPL-3.0-or-later
 *
 * Catégorie toolbox — éditer la liste des blocs ci-dessous.
 * Guide : docs/MODIFIER_TOOLBOX.md
 */
import { block, category, numberShadow, textShadow } from "../builder";

export const boardCategory = category("CAT_BOARD", {
  style: "board_category",
  icon: "fa-microchip"
}, [
  category("CAT_BOARD_BASE", {
    style: "board_category",
    icon: "fa-play"
  }, [
    block("include_library"),
    block("define"),
    block("comment"),
    block("board_base_setup_loop"),
    block("board_base_setup"),
    block("board_base_loop")
  ]),
  category("CAT_BOARD_IN", {
    style: "board_category",
    icon: "fa-right-to-bracket"
  }, [
    block("board_base_inout_digital_read"),
    block("board_base_inout_digital_read_pin", {
      inputs: {
        "PIN": numberShadow(0)
      }
    }),
    block("board_base_inout_digital_read_grid"),
    block("board_base_inout_digital_read_board"),
    block("board_base_inout_analog_read"),
    block("board_base_inout_highlow"),
    block("board_base_inout_map"),
    block("board_base_inout_pin_mode"),
    block("board_base_inout_pulsein"),
    block("board_base_inout_pulsein_timeout", {
      inputs: {
        "TIMEOUT": numberShadow(1000000)
      }
    })
  ]),
  category("CAT_BOARD_OUT", {
    style: "board_category",
    icon: "fa-right-from-bracket"
  }, [
    block("board_base_inout_buildin_led"),
    block("board_base_inout_digital_write"),
    block("board_base_inout_analog_write"),
    block("board_base_inout_analog_write_slider"),
    block("board_base_inout_tone"),
    block("board_base_inout_notone")
  ]),
  category("CAT_BOARD_TIME", {
    style: "board_category",
    icon: "fa-clock"
  }, [
    block("board_base_time_delay", {
      inputs: {
        "DELAY_TIME": numberShadow(1000)
      }
    }),
    block("board_base_time_delay_sec", {
      inputs: {
        "DELAY_TIME": numberShadow(1)
      }
    }),
    block("board_base_time_millis")
  ]),
  category("CAT_BOARD_CONVERSION", {
    style: "board_category",
    icon: "fa-right-left"
  }, [
    block("board_conversion_toint", {
      inputs: {
        "VALUE": numberShadow(0)
      }
    }),
    block("board_conversion_tofloat", {
      inputs: {
        "VALUE": numberShadow(0)
      }
    }),
    block("board_conversion_tochar", {
      inputs: {
        "VALUE": numberShadow(65)
      }
    }),
    block("board_conversion_tobyte", {
      inputs: {
        "VALUE": numberShadow(0)
      }
    }),
    block("board_conversion_toString", {
      inputs: {
        "VALUE": numberShadow(0)
      }
    }),
    block("board_conversion_constrain", {
      inputs: {
        "VALUE": numberShadow(0),
        "LOW": numberShadow(0),
        "HIGH": numberShadow(255)
      }
    })
  ]),
  category("CAT_BOARD_SERIAL", {
    style: "board_category",
    icon: "fa-terminal"
  }, [
    block("board_serial_begin"),
    block("board_serial_print", {
      inputs: {
        "TEXT": textShadow("")
      }
    }),
    block("board_serial_println", {
      inputs: {
        "TEXT": textShadow("")
      }
    }),
    block("board_serial_printfor", {
      inputs: {
        "CONTENT": numberShadow(0)
      }
    }),
    block("board_serial_write", {
      inputs: {
        "DATA": numberShadow(0)
      }
    }),
    block("board_serial_flush"),
    block("board_serial_read"),
    block("board_serial_peek"),
    block("board_serial_available"),
    block("board_serial_readString"),
    block("board_serial_readStringUntil", {
      inputs: {
        "TERMINATOR": textShadow("\\n")
      }
    }),
    block("board_serial_parseInt"),
    block("board_serial_parseFloat")
  ])
]);
