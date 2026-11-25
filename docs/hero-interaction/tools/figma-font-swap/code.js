// 현재 페이지의 Noto Sans KR 텍스트를 Pretendard Variable로 바꿉니다.
// 인스턴스 안의 텍스트는 건너뜁니다. 메인 컴포넌트를 바꾸면 인스턴스에 자동 반영되기 때문이에요.
const TARGET = 'Pretendard Variable';
const MAP = { Thin: 'Thin', Light: 'Light', DemiLight: 'Light', Regular: 'Regular', Medium: 'SemiBold', Bold: 'Bold', Black: 'Black' };

function insideInstance(node) {
  for (let p = node.parent; p; p = p.parent) if (p.type === 'INSTANCE') return true;
  return false;
}

async function main() {
  const page = figma.currentPage;
  await page.loadAsync();
  const needed = new Set(Object.values(MAP));
  await Promise.all([...needed].map((style) => figma.loadFontAsync({ family: TARGET, style })));

  let changed = 0, skipped = 0;
  for (const t of page.findAllWithCriteria({ types: ['TEXT'] })) {
    if (insideInstance(t)) { skipped++; continue; }
    const segs = t.getStyledTextSegments(['fontName']);
    if (!segs.some((s) => s.fontName.family === 'Noto Sans KR')) continue;
    await Promise.all(segs.map((s) => figma.loadFontAsync(s.fontName)));
    for (const s of segs) {
      if (s.fontName.family !== 'Noto Sans KR') continue;
      t.setRangeFontName(s.start, s.end, { family: TARGET, style: MAP[s.fontName.style] || 'Regular' });
    }
    changed++;
  }
  figma.closePlugin(`Pretendard로 변경: 텍스트 ${changed}개 (인스턴스 안 ${skipped}개는 메인 컴포넌트를 따라 자동 반영)`);
}

main().catch((e) => figma.closePlugin('오류: ' + e.message));
