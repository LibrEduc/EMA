/**
 * @packageDocumentation
 * @module Arduino.Generators.MathHelpers
 * @description Helper functions for math block generators.
 * @remarks
 * Original Blockly generator portions are under Apache-2.0. µcBlockly modifications under GPL-3.0-or-later.
 * Shared helpers for the math generator implementation.
 * @author scanet\@libreduc.cc (Sébastien Canet)
 * @license GPL-3.0-or-later
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * @license
 * Copyright (C) 2023-2026 ASTUCE (Sébastien Canet microcompany)
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
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later

 *
 * Hacker Mode block/category palette (Apache-2.0, Google LLC 2023):
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * Modifications copyright (C) 2023-2024 ASTUCE (Sébastien Canet microcompany)
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
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 *
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

import type { ArduinoGenerator } from "../arduino_generator";

/**
 * Adds math include headers to the generator.
 * Only needed for libm symbols (sin, sqrt, pow, …) not provided by Arduino.h alone.
 * @param generator - Arduino generator instance.
 */
export function addMathInclude(generator: ArduinoGenerator): void {
  generator.addInclude("math", "#include <math.h>");
}

/**
 * Injects an integer square-root helper (avoids &lt;math.h&gt; for list statistics).
 * @param generator - Arduino generator instance.
 */
export function addSqrtHelper(generator: ArduinoGenerator): void {
  generator.addCodeFunction(
    "math_sqrt",
    [
      "double math_sqrt(double value) {",
      "  if (value <= 0.0) {",
      "    return 0.0;",
      "  }",
      "  double root = value / 2.0;",
      "  for (uint8_t i = 0; i < 10; i++) {",
      "    root = (root + value / root) / 2.0;",
      "  }",
      "  return root;",
      "}",
    ].join("\n"),
  );
}

/**
 * Injects a prime-check helper into the generator.
 * @param generator - Arduino generator instance.
 */
export function addPrimeHelper(generator: ArduinoGenerator): void {
  generator.addCodeFunction(
    "math_isPrime",
    [
      "bool math_isPrime(long n) {",
      "  if (n <= 1) return false;",
      "  if (n <= 3) return true;",
      "  if (n % 2 == 0 || n % 3 == 0) return false;",
      "  for (long i = 5; i * i <= n; i += 6) {",
      "    if (n % i == 0 || n % (i + 2) == 0) return false;",
      "  }",
      "  return true;",
      "}",
    ].join("\n"),
  );
}

/**
 * Injects list helper functions into the generator.
 * @param generator - Arduino generator instance.
 */
export function addListHelpers(generator: ArduinoGenerator): void {
  addSqrtHelper(generator);
  generator.addCodeFunction(
    "math_list_helpers",
    [
      "template <typename T, size_t N>",
      "double math_sum(const T (&list)[N]) {",
      "  double sum = 0;",
      "  for (size_t i = 0; i < N; i++) {",
      "    sum += list[i];",
      "  }",
      "  return sum;",
      "}",
      "",
      "template <typename T, size_t N>",
      "T math_min(const T (&list)[N]) {",
      "  if (N == 0) return 0;",
      "  T minValue = list[0];",
      "  for (size_t i = 1; i < N; i++) {",
      "    if (list[i] < minValue) minValue = list[i];",
      "  }",
      "  return minValue;",
      "}",
      "",
      "template <typename T, size_t N>",
      "T math_max(const T (&list)[N]) {",
      "  if (N == 0) return 0;",
      "  T maxValue = list[0];",
      "  for (size_t i = 1; i < N; i++) {",
      "    if (list[i] > maxValue) maxValue = list[i];",
      "  }",
      "  return maxValue;",
      "}",
      "",
      "template <typename T, size_t N>",
      "double math_mean(const T (&list)[N]) {",
      "  if (N == 0) return 0;",
      "  return math_sum(list) / N;",
      "}",
      "",
      "template <typename T, size_t N>",
      "double math_median(const T (&list)[N]) {",
      "  if (N == 0) return 0;",
      "  T temp[N];",
      "  for (size_t i = 0; i < N; i++) {",
      "    temp[i] = list[i];",
      "  }",
      "  for (size_t i = 0; i < N; i++) {",
      "    for (size_t j = i + 1; j < N; j++) {",
      "      if (temp[j] < temp[i]) {",
      "        T swap = temp[i];",
      "        temp[i] = temp[j];",
      "        temp[j] = swap;",
      "      }",
      "    }",
      "  }",
      "  if (N % 2 == 1) {",
      "    return temp[N / 2];",
      "  }",
      "  return (static_cast<double>(temp[N / 2 - 1]) + temp[N / 2]) / 2;",
      "}",
      "",
      "template <typename T, size_t N>",
      "T math_mode(const T (&list)[N]) {",
      "  if (N == 0) return 0;",
      "  T modeValue = list[0];",
      "  size_t modeCount = 1;",
      "  for (size_t i = 0; i < N; i++) {",
      "    size_t count = 1;",
      "    for (size_t j = i + 1; j < N; j++) {",
      "      if (list[j] == list[i]) count++;",
      "    }",
      "    if (count > modeCount) {",
      "      modeCount = count;",
      "      modeValue = list[i];",
      "    }",
      "  }",
      "  return modeValue;",
      "}",
      "",
      "template <typename T, size_t N>",
      "double math_standard_deviation(const T (&list)[N]) {",
      "  if (N == 0) return 0;",
      "  double mean = math_mean(list);",
      "  double sum = 0;",
      "  for (size_t i = 0; i < N; i++) {",
      "    double diff = list[i] - mean;",
      "    sum += diff * diff;",
      "  }",
      "  return math_sqrt(sum / N);",
      "}",
      "",
      "template <typename T, size_t N>",
      "T math_random_list(const T (&list)[N]) {",
      "  if (N == 0) return 0;",
      "  long index = random(0, static_cast<long>(N));",
      "  return list[index];",
      "}",
    ].join("\n"),
  );
}
