<div align="center">

![µcBlockly](../public/assets/logo_µcBlockly.png)

# Suivi d’améliorations (v3)

</div>

Document de suivi **à jour pour la v3** (Blockly 13). Les anciennes notes de revue (tailles de fichiers, flags `ENABLE_*`, « aucun test ») sont obsolètes et ont été retirées.

---

## Déjà en place (ne pas rouvrir)

- Séparation **core / host / demo** (`package.json` exports, [KERNEL.md](./KERNEL.md))
- Cycle `shared` ↔ `block_types_registry` cassé (injection `registerVariableTypeForBlockResolver`)
- Génération : workspace vide sans stubs ; setup/loop vides émis si les blocs sont présents ; erreurs de définition de listes en section globale
- Headers GPL + `@packageDocumentation` uniformes ; quasi zéro `any` / `@ts-ignore`
- Tests sous `tests/*.test.ts` (générateurs, typing, fields, convertisseur rduino, core-api)

---

## Pistes encore ouvertes

| Priorité | Sujet | Notes |
|----------|--------|--------|
| Haute | Découper `shared.ts` / `arduino_generator.ts` | God modules (~1200 L) |
| Haute | Boot DOM démo (`getElementById` + `!`) | Fail soft / résolution unique |
| Moyenne | Étendre `core-api.test.ts` | `createUcBlockly`, persistence, checker |
| Moyenne | Isoler `blockly_patches.ts` | Facade + tests au bump Blockly |
| Basse | Factoriser mutators `+/-` | `array` / `libre` / `logic` |

Voir aussi [ARCHITECTURE.md](./ARCHITECTURE.md) et [REPARTITION_FICHIERS.md](./REPARTITION_FICHIERS.md).
