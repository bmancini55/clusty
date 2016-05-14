
export function log() {
  console.log.apply(console, arguments);
}

export function title(title) {
  console.log(title.bold.white);
}
