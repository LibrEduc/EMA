/**
 * Blockly@rduino → µcBlockly block type mapping.
 * Covers the Arduino core (arduino_base / serial / conversion) and a few S4e aliases.
 */

/** @type {Readonly<Record<string, string>>} */
export const BLOCK_TYPE_MAP = {
  // Program structure
  base_setup: "board_base_setup",
  base_loop: "board_base_loop",
  base_setup_loop: "board_base_setup_loop",

  // Inputs / outputs
  inout_buildin_led: "board_base_inout_buildin_led",
  inout_digital_write: "board_base_inout_digital_write",
  inout_digital_write_validator: "board_base_inout_digital_write",
  inout_digital_read: "board_base_inout_digital_read",
  inout_digital_read_check: "board_base_inout_digital_read",
  inout_digital_read_validator: "board_base_inout_digital_read",
  inout_PWM_write: "board_base_inout_analog_write",
  inout_PWM_write_validator: "board_base_inout_analog_write",
  inout_analog_write: "board_base_inout_analog_write",
  inout_analog_write_validator: "board_base_inout_analog_write",
  inout_analog_read: "board_base_inout_analog_read",
  inout_analog_read_validator: "board_base_inout_analog_read",
  inout_onoff: "board_base_inout_highlow",
  inout_highlow: "board_base_inout_highlow",
  inout_pulsein: "board_base_inout_pulsein",
  inout_pulsein_timeout: "board_base_inout_pulsein_timeout",
  inout_digital_mode: "board_base_inout_pin_mode",
  inout_angle: "inout_angle_maths",
  tone: "board_base_inout_tone",
  tone_notime: "board_base_inout_tone",
  notone: "board_base_inout_notone",

  // Time / utilities
  base_delay: "board_base_time_delay",
  base_delay_sec: "board_base_time_delay_sec",
  millis: "board_base_time_millis",
  base_map: "board_base_inout_map",
  various_constrain: "board_conversion_constrain",
  conversion_map: "board_base_inout_map",

  // Conversions
  conversion_toint: "board_conversion_toint",
  conversion_tofloat: "board_conversion_tofloat",
  conversion_tochar: "board_conversion_tochar",
  conversion_tobyte: "board_conversion_tobyte",
  conversion_toString: "board_conversion_toString",

  // Serial
  serial_init: "board_serial_begin",
  serial_print: "board_serial_print",
  serial_print_tab: "board_serial_print",
  serial_println: "board_serial_println",
  serial_printfor: "board_serial_printfor",
  serial_read: "board_serial_read",
  serial_available: "board_serial_available",
  serial_write: "board_serial_write",
  serial_write_out: "board_serial_write",
  serial_line: "board_serial_println",
  serial_readStringUntil: "board_serial_readStringUntil",
  serial_readString: "board_serial_readString",
  serial_flush: "board_serial_flush",
  serial_peek: "board_serial_peek",
  serial_parseInt: "board_serial_parseInt",
  serial_parseFloat: "board_serial_parseFloat",

  // Variables / macros (aliases already handled on the µcBlockly side)
  variable_define: "variables_define",

  // Text / date
  current_date: "text_date",

  // Free-form code → comment
  base_code: "libre_out",
  base_comment: "libre_out",
};

/** Hat block types or structural containers. */
export const HAT_BLOCK_TYPES = new Set([
  "board_base_setup",
  "board_base_loop",
  "board_base_setup_loop",
  "base_setup",
  "base_loop",
  "base_setup_loop",
]);

/** Skipped types (structure or metadata with no useful equivalent). */
export const SKIP_BLOCK_TYPES = new Set([
  "base_begin",
  "base_end",
  "include_file",
  "tempo_no_delay",
  "base_toggle",
]);

/**
 * Input rename table by source type (after type mapping if needed).
 * Key = Blockly@rduino source type.
 */
export const INPUT_RENAME_BY_SOURCE = {
  base_setup: { DO: "SETUP" },
  base_setup_loop: { DO: "SETUP" },
  board_base_setup: { DO: "SETUP" },
  board_base_setup_loop: { DO: "SETUP" },
  serial_print: { CONTENT: "TEXT" },
  serial_print_tab: { CONTENT: "TEXT" },
  serial_println: { CONTENT: "TEXT" },
  serial_line: { CONTENT: "TEXT" },
  serial_write: { CONTENT: "DATA" },
  serial_write_out: { CONTENT: "DATA" },
  inout_PWM_write: { NUM: "PWM" },
  inout_PWM_write_validator: { NUM: "PWM" },
  inout_analog_write: { NUM: "PWM" },
  inout_analog_write_validator: { NUM: "PWM" },
};

/**
 * Field rename table by source type.
 */
export const FIELD_RENAME_BY_SOURCE = {
  serial_init: { SPEED: "BAUD" },
  inout_analog_read: { broche: "PIN" },
  inout_analog_read_validator: { broche: "PIN", PIN: "PIN" },
  inout_onoff: { BOOL: "BOOL" },
  inout_buildin_led: { STAT: "STAT" },
};

/**
 * @param {string} sourceType
 * @returns {string | null}
 */
export function mapBlockType(sourceType) {
  if (SKIP_BLOCK_TYPES.has(sourceType)) {
    return null;
  }
  return BLOCK_TYPE_MAP[sourceType] ?? sourceType;
}

/**
 * @param {string} sourceType
 * @param {string} inputName
 * @returns {string}
 */
export function mapInputName(sourceType, inputName) {
  const table = INPUT_RENAME_BY_SOURCE[sourceType];
  return table?.[inputName] ?? inputName;
}

/**
 * @param {string} sourceType
 * @param {string} fieldName
 * @returns {string}
 */
export function mapFieldName(sourceType, fieldName) {
  const table = FIELD_RENAME_BY_SOURCE[sourceType];
  return table?.[fieldName] ?? fieldName;
}
