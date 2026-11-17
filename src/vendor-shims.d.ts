// The µcBlockly demo shell calls webpack's require(), and tsc reaches it
// through our imports. EMA never runs it: do not call require() in src/.
declare function require(id: string): any;
