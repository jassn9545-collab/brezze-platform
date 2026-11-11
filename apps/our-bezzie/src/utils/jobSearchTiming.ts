let filterOpenedAt = 0;

export function markFilterOpen() {
  filterOpenedAt = Date.now();
  console.info('[job-search] filter_open');
}

export function logFilterStage(stage: 'focus' | 'frame' | 'transition') {
  if (filterOpenedAt) console.info(`[job-search] filter_${stage}_ms=${Date.now() - filterOpenedAt}`);
}
