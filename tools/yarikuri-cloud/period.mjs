function isoDate(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function ym(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'); }

/** その月の給料日。月にない日は末日に丸め、土日祝なら前の平日へ前倒しする */
function paydayOn(year, month, day) {
  var eff = Math.min(day, new Date(year, month + 1, 0).getDate());
  var d = new Date(year, month, eff);
  while (!isBusinessDay(d)) d.setDate(d.getDate() - 1);
  return d;
}

/** その日が含まれる期間。{key, start, end} */
function periodOfDate(date, day) {
  var d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (!day) {
    return {
      key: ym(d),
      start: isoDate(new Date(d.getFullYear(), d.getMonth(), 1)),
      end: isoDate(new Date(d.getFullYear(), d.getMonth() + 1, 0))
    };
  }
  // その月の給料日をまだ迎えていなければ、前月の給料日が起点
  var start = paydayOn(d.getFullYear(), d.getMonth(), day);
  if (d < start) start = paydayOn(d.getFullYear(), d.getMonth() - 1, day);
  var next = paydayOn(start.getFullYear(), start.getMonth() + 1, day);
  var end = new Date(next);
  end.setDate(end.getDate() - 1);
  // 期間の名前は、いちばん多く重なる月＝中間日が属する月
  var mid = new Date((start.getTime() + end.getTime()) / 2);
  return { key: ym(mid), start: isoDate(start), end: isoDate(end) };
}

/** 期間の名前（YYYY-MM）から期間を復元する */
function periodByKey(key, day) {
  var p = key.split('-').map(Number);
  if (day) {
    for (var i = -1; i <= 1; i++) {
      var probe = periodOfDate(new Date(p[0], p[1] - 1 + i, 15), day);
      if (probe.key === key) return probe;
    }
  }
  return {
    key: key,
    start: isoDate(new Date(p[0], p[1] - 1, 1)),
    end: isoDate(new Date(p[0], p[1], 0))
  };
}

function periodKeyOf(dateStr, day) {
  if (!day) return dateStr.slice(0, 7);
  var p = dateStr.split('-').map(Number);
  return periodOfDate(new Date(p[0], p[1] - 1, p[2]), day).key;
}

/** 「7/25〜8/24」形式 */
var holidayCache;

function dayKey(d) { return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate(); }

/** その年 y の m 月（0始まり）の第 nth 月曜の日にち */
function nthMonday(y, m, nth) {
  return 1 + ((8 - new Date(y, m, 1).getDay()) % 7) + (nth - 1) * 7;
}

/** 日本の祝日（振替休日・国民の休日を含む）。1980〜2099年ごろで有効 */
function holidaysOf(year) {
  if (!holidayCache) holidayCache = {};
  if (holidayCache[year]) return holidayCache[year];
  var equinox = function (base) {
    return Math.floor(base + 0.242194 * (year - 1980) - Math.floor((year - 1980) / 4));
  };
  var base = [
    [0, 1],                        // 元日
    [0, nthMonday(year, 0, 2)],    // 成人の日
    [1, 11],                       // 建国記念の日
    [1, 23],                       // 天皇誕生日
    [2, equinox(20.8431)],         // 春分の日
    [3, 29],                       // 昭和の日
    [4, 3], [4, 4], [4, 5],        // 憲法記念日・みどりの日・こどもの日
    [6, nthMonday(year, 6, 3)],    // 海の日
    [7, 11],                       // 山の日
    [8, nthMonday(year, 8, 3)],    // 敬老の日
    [8, equinox(23.2488)],         // 秋分の日
    [9, nthMonday(year, 9, 2)],    // スポーツの日
    [10, 3], [10, 23]              // 文化の日・勤労感謝の日
  ];
  var set = {};
  base.forEach(function (md) { set[dayKey(new Date(year, md[0], md[1]))] = true; });

  // 振替休日：日曜と重なった祝日は、その後の最初の平日を休日にする
  base.forEach(function (md) {
    var d = new Date(year, md[0], md[1]);
    if (d.getDay() !== 0) return;
    do { d.setDate(d.getDate() + 1); } while (set[dayKey(d)]);
    set[dayKey(d)] = true;
  });

  // 国民の休日：祝日と祝日に挟まれた平日も休日になる
  base.forEach(function (md) {
    var d = new Date(year, md[0], md[1] + 1);
    if (set[dayKey(d)] || d.getDay() === 0) return;
    var next = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    if (set[dayKey(next)]) set[dayKey(d)] = true;
  });

  holidayCache[year] = set;
  return set;
}

function isBusinessDay(d) {
  return d.getDay() !== 0 && d.getDay() !== 6 && !holidaysOf(d.getFullYear())[dayKey(d)];
}

export { isoDate, ym, paydayOn, periodOfDate, periodByKey, periodKeyOf, isBusinessDay, holidaysOf };
export const currentPeriod = (day, now = new Date()) => periodOfDate(now, day);

