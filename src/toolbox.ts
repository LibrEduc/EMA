/**
 * @packageDocumentation
 * @module Toolbox
 * @description Toolbox configuration and block definitions for µcBlockly
 * @remarks
 * Defines toolbox categories, labels, and block lists.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see \<https://www.gnu.org/licenses/\>.
 * 
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import '@blockly/field-angle';
import { DEFAULT_BLOCK_LEVELS } from "./block_levels";

/** Niveaux par défaut pour les entrées bloc de la toolbox. */
export { DEFAULT_BLOCK_LEVELS as DEFAULT_TOOLBOX_BLOCK_LEVELS } from "./block_levels";

/**
 * Block entry in a toolbox category (flat block with type).
 */
export type ToolboxBlockEntry = {
  kind: string,
  type: string,
  /** Niveaux pédagogiques autorisés (ex. "1, 2, 3"). */
  levels?: string,
  fields?: { [key: string]: number | string },
  inputs?: {
    [key: string]: {
      shadow?: { type?: string, fields?: { [key: string]: number | string } },
      block?: { type: string },
    }
  },
};

/**
 * Ajoute la propriété levels à chaque entrée kind:"block" (récursif).
 */
export function applyToolboxBlockLevels(
  toolbox: ToolboxConfiguration,
  levels: string = DEFAULT_BLOCK_LEVELS,
): ToolboxConfiguration {
  const clone = JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
  const walk = (items: ToolboxCategoryContentEntry[] | undefined): void => {
    if (!items) {
      return;
    }
    for (const item of items) {
      if (item.kind === "block" && "type" in item) {
        (item as ToolboxBlockEntry).levels = levels;
      }
      if ("contents" in item && Array.isArray(item.contents)) {
        walk(item.contents);
      }
    }
  };
  for (const category of clone.contents) {
    walk(category.contents);
  }
  return clone;
}

/**
 * Category entry: can contain blocks or nested subcategories (submenus).
 */
export type ToolboxCategoryContentEntry = ToolboxBlockEntry | {
  kind: string,
  name?: string,
  categorystyle?: string,
  custom?: string,
  contents?: ToolboxCategoryContentEntry[],
};

/**
 * Top-level toolbox configuration.
 * @param kind - "categoryToolbox".
 * @param contents - Array of categories (each may have nested subcategories in contents).
 */
export type ToolboxConfiguration = {
  kind: string,
  contents: Array<{
    kind: string,
    name?: string,
    categorystyle?: string,
    custom?: string,
    contents?: ToolboxCategoryContentEntry[],
    blockxml?: string
  }>
}

/** Default toolbox: categories and block list (search, Libre, Logic, Loops, Math, etc.). */
const basic_toolbox_source: ToolboxConfiguration = {
  'kind': 'categoryToolbox',
  'contents': [
    /*{
      kind: 'category',
      name: 'Frequently Used',
      custom: 'MOST_USED',
      categorystyle: 'frequently_used_category',
    },
    {
      kind: 'category',
      name: 'Recently Used',
      custom: 'RECENTLY_USED',
      categorystyle: 'recently_used_category',
    },*/
    {
      'kind': 'search',
      'name': 'CAT_SEARCH',
      'contents': [],
    },
    {
      'kind': 'category',
      'name': 'CAT_LIBRE',
      'categorystyle': 'libre_category',
      'contents': [
        { 'kind': 'block', 'type': 'libre_start' },
        { 'kind': 'block', 'type': 'libre_in' },
        { 'kind': 'block', 'type': 'libre_out' },
        { 'kind': 'block', 'type': 'libre_in_out' },
        { 'kind': 'block', 'type': 'libre_end' },
        { 'kind': 'block', 'type': 'libre_loop' },
        { 'kind': 'block', 'type': 'libre_loop_with_return' },
        { 'kind': 'block', 'type': 'libre_loop_inside' },
        { 'kind': 'block', 'type': 'libre_loop_inside_in' },
        { 'kind': 'block', 'type': 'libre_loop_inside_in_mutator' },
        { 'kind': 'block', 'type': 'libre_loop_do_inside' },
        { 'kind': 'block', 'type': 'libre_loop_do_inside_in' },
      ],
    },
    {
      'kind': 'category',
      'name': 'CAT_BOARD',
      'categorystyle': 'board_category',
      'contents': [
        {
          'kind': 'category',
          'name': 'CAT_BOARD_BASE',
          'categorystyle': 'board_category',
          'contents': [
            { 'kind': 'block', 'type': 'board_base_setup_loop' },
            { 'kind': 'block', 'type': 'board_base_setup' },
            { 'kind': 'block', 'type': 'board_base_loop' },
          ],
        },
        {
          'kind': 'category',
          'name': 'CAT_BOARD_IN',
          'categorystyle': 'board_category',
          'contents': [
            { 'kind': 'block', 'type': 'board_base_inout_digital_read' },
            { 'kind': 'block', 'type': 'board_base_inout_analog_read' },
            { 'kind': 'block', 'type': 'board_base_inout_highlow' },
            { 'kind': 'block', 'type': 'board_base_inout_map' },
            { 'kind': 'block', 'type': 'board_base_inout_pin_mode' },
            { 'kind': 'block', 'type': 'board_base_inout_pulsein' },
            { 'kind': 'block', 'type': 'board_base_inout_pulsein_timeout', 'inputs': { 'TIMEOUT': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 1000000 } } } } },
          ],
        },
        {
          'kind': 'category',
          'name': 'CAT_BOARD_OUT',
          'categorystyle': 'board_category',
          'contents': [
            { 'kind': 'block', 'type': 'board_base_inout_buildin_led' },
            { 'kind': 'block', 'type': 'board_base_inout_digital_write' },
            { 'kind': 'block', 'type': 'board_base_inout_analog_write' },
            { 'kind': 'block', 'type': 'board_base_inout_analog_write_slider' },
            { 'kind': 'block', 'type': 'board_base_inout_tone' },
            { 'kind': 'block', 'type': 'board_base_inout_notone' },
          ],
        },
        {
          'kind': 'category',
          'name': 'CAT_BOARD_TIME',
          'categorystyle': 'board_category',
          'contents': [
            { 'kind': 'block', 'type': 'board_base_time_delay', 'inputs': { 'DELAY_TIME': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 1000 } } } } },
            { 'kind': 'block', 'type': 'board_base_time_delay_sec', 'inputs': { 'DELAY_TIME': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 1 } } } } },
            { 'kind': 'block', 'type': 'board_base_time_millis' },
          ],
        },
        {
          'kind': 'category',
          'name': 'CAT_BOARD_CONVERSION',
          'categorystyle': 'board_category',
          'contents': [
            { 'kind': 'block', 'type': 'board_conversion_toint', 'inputs': { 'VALUE': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } } } },
            { 'kind': 'block', 'type': 'board_conversion_tofloat', 'inputs': { 'VALUE': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } } } },
            { 'kind': 'block', 'type': 'board_conversion_tochar', 'inputs': { 'VALUE': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 65 } } } } },
            { 'kind': 'block', 'type': 'board_conversion_tobyte', 'inputs': { 'VALUE': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } } } },
            { 'kind': 'block', 'type': 'board_conversion_toString', 'inputs': { 'VALUE': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } } } },
            { 'kind': 'block', 'type': 'board_conversion_constrain', 'inputs': { 'VALUE': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } }, 'LOW': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } }, 'HIGH': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 255 } } } } },
          ],
        },
        {
          'kind': 'category',
          'name': 'CAT_BOARD_SERIAL',
          'categorystyle': 'board_category',
          'contents': [
            { 'kind': 'block', 'type': 'board_serial_begin' },
            { 'kind': 'block', 'type': 'board_serial_print', 'inputs': { 'TEXT': { 'shadow': { 'type': 'text', 'fields': { 'TEXT': '' } } } } },
            { 'kind': 'block', 'type': 'board_serial_println', 'inputs': { 'TEXT': { 'shadow': { 'type': 'text', 'fields': { 'TEXT': '' } } } } },
            { 'kind': 'block', 'type': 'board_serial_printfor', 'inputs': { 'CONTENT': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } } } },
            { 'kind': 'block', 'type': 'board_serial_write', 'inputs': { 'DATA': { 'shadow': { 'type': 'math_number', 'fields': { 'NUM': 0 } } } } },
            { 'kind': 'block', 'type': 'board_serial_flush' },
            { 'kind': 'block', 'type': 'board_serial_read' },
            { 'kind': 'block', 'type': 'board_serial_peek' },
            { 'kind': 'block', 'type': 'board_serial_available' },
            { 'kind': 'block', 'type': 'board_serial_readString' },
            { 'kind': 'block', 'type': 'board_serial_readStringUntil', 'inputs': { 'TERMINATOR': { 'shadow': { 'type': 'text', 'fields': { 'TEXT': '\\n' } } } } },
            { 'kind': 'block', 'type': 'board_serial_parseInt' },
            { 'kind': 'block', 'type': 'board_serial_parseFloat' },
          ],
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'CAT_LOGIC',
      'categorystyle': 'logic_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'controls_if',
        },
        {
          'kind': 'block',
          'type': 'controls_ifelse',
        },
        {
          'kind': 'block',
          'type': 'controls_switch',
        },
        {
          'kind': 'block',
          'type': 'logic_compare',
        },
        {
          'kind': 'block',
          'type': 'logic_operation',
        },
        {
          'kind': 'block',
          'type': 'logic_negate',
        },
        {
          'kind': 'block',
          'type': 'logic_boolean',
        },
        {
          'kind': 'block',
          'type': 'logic_null',
        },
        {
          'kind': 'block',
          'type': 'logic_ternary',
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'CAT_LOOPS',
      'categorystyle': 'loop_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'controls_repeat_ext',
          'inputs': {
            'TIMES': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 10,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'controls_repeat',
        },
        {
          'kind': 'block',
          'type': 'controls_whileUntil',
        },
        {
          'kind': 'block',
          'type': 'controls_for',
          'inputs': {
            'FROM': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
            'TO': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 10,
                },
              },
            },
            'BY': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'controls_forEach',
        },
        {
          'kind': 'block',
          'type': 'controls_flow_statements',
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'CAT_MATHS',
      'categorystyle': 'math_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'math_number',
          'fields': {
            'NUM': 123,
          },
        },
        {
          'kind': 'block',
          'type': 'math_percent',
        },
        {
          'kind': 'block',
          'type': 'math_change',
          'inputs': {
            'DELTA': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'inout_angle_maths',
        },
        {
          'kind': 'block',
          'type': 'math_arithmetic',
          'inputs': {
            'A': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
            'B': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_interval',
        },
        {
          'kind': 'block',
          'type': 'math_single',
          'inputs': {
            'NUM': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 9,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_trig',
          'inputs': {
            'NUM': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 45,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_constant',
        },
        {
          'kind': 'block',
          'type': 'math_number_property',
          'inputs': {
            'NUMBER_TO_CHECK': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 0,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_round',
          'fields': {
            'OP': 'ROUND',
          },
          'inputs': {
            'NUM': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 3.1,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_on_list',
          'fields': {
            'OP': 'SUM',
          },
        },
        {
          'kind': 'block',
          'type': 'math_modulo',
          'inputs': {
            'DIVIDEND': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 64,
                },
              },
            },
            'DIVISOR': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 10,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_constrain',
          'inputs': {
            'VALUE': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 50,
                },
              },
            },
            'LOW': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
            'HIGH': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 100,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_random_int',
          'inputs': {
            'FROM': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
            'TO': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 100,
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'math_random_float',
        },
        {
          'kind': 'block',
          'type': 'math_atan2',
          'inputs': {
            'X': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
            'Y': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 1,
                },
              },
            },
          },
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'CAT_TEXT',
      'categorystyle': 'text_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'text',
        },
        {
          'kind': 'block',
          'type': 'text_multiline',
          'fields': {
            'TEXT': 'µc\nblockly',
          },
        },
        {
          'kind': 'block',
          'type': 'text_char',
        },
        {
          'kind': 'block',
          'type': 'text_no_quote',
        },
        {
          'kind': 'block',
          'type': 'text_date',
        },
        {
          'kind': 'block',
          'type': 'text_join',
        },
        {
          'kind': 'block',
          'type': 'text_append',
          'inputs': {
            'TEXT': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': '',
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_length',
        },
        {
          'kind': 'block',
          'type': 'text_isEmpty',
          'inputs': {
            'VALUE': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': '',
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_indexOf',
          'inputs': {
            'VALUE': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': 'abc',
                },
              },
            },
            'FIND': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': 'abc',
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_charAt',
          'inputs': {
            'VALUE': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': 'abc',
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_getSubstring',
          'inputs': {
            'STRING': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': 'abc',
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_changeCase',
          'inputs': {
            'TEXT': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': 'abc',
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_trim',
          'inputs': {
            'TEXT': {
              'shadow': {
                'type': 'text',
                'fields': {
                  'TEXT': 'abc',
                },
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_print',
          'inputs': {
            'TEXT': {
              'shadow': {
                'type': 'text',
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_prompt_ext',
          'inputs': {
            'TEXT': {
              'shadow': {
                'type': 'text',
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_count',
          'inputs': {
            'SUB': {
              'shadow': {
                'type': 'text',
              },
            },
            'TEXT': {
              'shadow': {
                'type': 'text',
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_replace',
          'inputs': {
            'FROM': {
              'shadow': {
                'type': 'text',
              },
            },
            'TO': {
              'shadow': {
                'type': 'text',
              },
            },
            'TEXT': {
              'shadow': {
                'type': 'text',
              },
            },
          },
        },
        {
          'kind': 'block',
          'type': 'text_reverse',
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'CAT_LISTS',
      'categorystyle': 'list_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'Array_with',
        },
        {
          'kind': 'block',
          'type': 'Array_declare',
        },
        {
          'kind': 'block',
          'type': 'Array_create',
        },
        {
          'kind': 'block',
          'type': 'Array_getIndex_in_list',
        },
        {
          'kind': 'block',
          'type': 'Array_modify',
        },
        {
          'kind': 'block',
          'type': 'Array_fix',
        },
        {
          'kind': 'block',
          'type': 'Array_getIndex_in_array',
        },
      ],
    },
    {
      'kind': 'category',
      'name': 'CAT_COLOR',
      'categorystyle': 'colour_category',
      'contents': [
        {
          'kind': 'block',
          'type': 'colour_picker',
        },
        {
          'kind': 'block',
          'type': 'color_picker_custom',
        },
        {
          'kind': 'block',
          'type': 'color_picker_hsv',
        },
        {
          'kind': 'block',
          'type': 'colour_random',
        },
        {
          'kind': 'block',
          'type': 'colour_rgb',
        },
        {
          'kind': 'block',
          'type': 'colour_blend',
          'inputs': {
            'COLOUR1': {
              'shadow': {
                'type': 'colour_picker',
              },
            },
            'COLOUR2': {
              'shadow': {
                'type': 'colour_picker',
              },
            },
            'RATIO': {
              'shadow': {
                'type': 'math_number',
                'fields': {
                  'NUM': 0.5,
                },
              },
            },
          },
        },
      ],
    },
    {
      'kind': 'sep',
    },
    {
      'kind': 'category',
      'name': 'CAT_VARIABLES',
      'categorystyle': 'variable_category',
      'custom': 'TYPED_VARIABLES',
    },
    {
      'kind': 'category',
      'name': 'CAT_FUNCTIONS',
      'categorystyle': 'procedure_category',
      'custom': 'PROCEDURE',
    },
  ]
};

export const basic_toolbox: ToolboxConfiguration =
  applyToolboxBlockLevels(basic_toolbox_source);

const CAT_BOARD_NAME = 'CAT_BOARD';

/**
 * Returns a deep clone of the toolbox with the board category (CAT_BOARD) removed.
 * Used when no board is selected so the toolbox does not show board blocks.
 */
export function getToolboxWithoutBoardCategory(toolbox: ToolboxConfiguration): ToolboxConfiguration {
  const clone = JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
  if (Array.isArray(clone.contents)) {
    clone.contents = clone.contents.filter((c) => c.name !== CAT_BOARD_NAME);
  }
  return clone;
}

/**
 * Returns the toolbox to use for the workspace: without the board category if
 * no board is selected, otherwise a clone of the full toolbox.
 * Read the current selection from the board menu in the DOM.
 */
export function getToolboxForCurrentBoard(toolbox: ToolboxConfiguration): ToolboxConfiguration {
  const menu = document.getElementById('boardMenu') as HTMLSelectElement | null;
  const value = menu?.value?.trim();
  if (!value || value === 'none') {
    return getToolboxWithoutBoardCategory(toolbox);
  }
  return JSON.parse(JSON.stringify(toolbox)) as ToolboxConfiguration;
}