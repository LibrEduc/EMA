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

/**
 * The above type represents the configuration of a toolbox in TypeScript, which includes
 * various kinds of blocks and their properties.
 * @param kind - The "kind" property in the ToolboxConfiguration type represents the
 * type or category of the toolbox item. It can be a string value that describes the kind of
 * item, such as "category", "block", or "separator".
 * @param contents - The `contents` property is an array that contains objects with the
 * following properties:
 */
export type ToolboxConfiguration = {
  kind: string,
  contents: Array<{
    kind: string,
    name?: string,
    categorystyle?: string,
    custom?: string,
    contents?: Array<{
      kind: string,
      type: string,
      fields?: {
        [key: string]: number | string
      },
      inputs?: {
        [key: string]: {
          shadow?: {
            type?: string,
            fields?: {
              [key: string]: number | string
            }
          },
          block?: {
            type: string,
          }
        }
      },
    }>,
    blockxml?: string
  }>
}

/* The above code is defining a toolbox configuration for a coding environment. */
export const basic_toolbox: ToolboxConfiguration = {
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
    // {
    //   'kind': 'search',
    //   'name': 'Search',
    //   'contents': [],
    // },
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
          'type': 'text_no_quote',
        },
        {
          'kind': 'block',
          'type': 'text_multiline',
        },
        {
          'kind': 'block',
          'type': 'text_date',
        },
        {
          'kind': 'block',
          'type': 'text_char',
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
}