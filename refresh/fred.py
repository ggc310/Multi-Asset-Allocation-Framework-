"""Inflation breakevens, real yields, credit spreads and credit returns by rating, from FRED.
Usage: python3 fred.py OUT.json
Writes one row per date: {date, <series>: value, ...}. FRED serves the ICE BofA series for the past
three years only, so spread and rating-bucket return history starts about three years back; the
Treasury breakeven and TIPS real-yield series go back to 2003."""
import csv, io, json, sys, time, urllib.request

SERIES = {
    # inflation breakevens and real yields (Treasury / Federal Reserve)
    'be5': 'T5YIE', 'be10': 'T10YIE', 'be5y5y': 'T5YIFR',
    'ry5': 'DFII5', 'ry10': 'DFII10', 'ry30': 'DFII30',
    'n3m': 'DGS3MO', 'n2': 'DGS2', 'n5': 'DGS5', 'n10': 'DGS10', 'n30': 'DGS30',
    # option-adjusted spreads, percent (ICE BofA)
    'oas_ig': 'BAMLC0A0CM', 'oas_aaa': 'BAMLC0A1CAAA', 'oas_aa': 'BAMLC0A2CAA', 'oas_a': 'BAMLC0A3CA', 'oas_bbb': 'BAMLC0A4CBBB',
    'oas_hy': 'BAMLH0A0HYM2', 'oas_bb': 'BAMLH0A1HYBB', 'oas_b': 'BAMLH0A2HYB', 'oas_ccc': 'BAMLH0A3HYC',
    # total return indices (ICE BofA)
    'tr_ig': 'BAMLCC0A0CMTRIV', 'tr_aaa': 'BAMLCC0A1AAATRIV', 'tr_aa': 'BAMLCC0A2AATRIV', 'tr_a': 'BAMLCC0A3ATRIV', 'tr_bbb': 'BAMLCC0A4BBBTRIV',
    'tr_hy': 'BAMLHYH0A0HYM2TRIV', 'tr_bb': 'BAMLHYH0A1BBTRIV', 'tr_b': 'BAMLHYH0A2BTRIV', 'tr_ccc': 'BAMLHYH0A3CMTRIV',
}
START = '2003-01-01'


def pull(fid):
    url = f'https://fred.stlouisfed.org/graph/fredgraph.csv?id={fid}&cosd={START}'
    err = None
    for i in range(4):
        try:
            txt = urllib.request.urlopen(url, timeout=60).read().decode()
            out = {}
            for row in csv.reader(io.StringIO(txt)):
                if len(row) < 2 or not row[0][:1].isdigit():
                    continue
                try:
                    out[row[0]] = float(row[1])
                except ValueError:
                    pass
            if out:
                return out
            err = ValueError('no rows')
        except Exception as e:
            err = e
        time.sleep(2 * (i + 1))
    raise err


def main(path):
    by = {}
    got, failed = 0, []
    for key, fid in SERIES.items():
        try:
            for d, v in pull(fid).items():
                by.setdefault(d, {})[key] = v
            got += 1
        except Exception as e:
            failed.append(f'{fid} ({e})')
    if got < len(SERIES) // 2:
        sys.exit('FRED: too many series failed: ' + ', '.join(failed))
    rows = [{'date': d, **by[d]} for d in sorted(by)]
    json.dump(rows, open(path, 'w'), separators=(',', ':'))
    print(f'fred: {got}/{len(SERIES)} series, {len(rows)} dates, last {rows[-1]["date"]}' + (('; failed ' + ', '.join(failed)) if failed else ''))


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else 'out/rates_credit.json')
