// POST /api/admin/action — {op, ...}: confirm, decline, add, remove, rates, setting, price, pay, unpay.
import { loadState, bestRoom, roomFree, quote, uid, isDate, today, json } from '../../_lib/core.js';
export async function onRequestPost({ request, env }) {
  const db = env.DB;
  let b; try { b = await request.json(); } catch { return json({ ok: false, msg: 'bad json' }, 400); }
  const st = await loadState(db, { full: true });
  const find = id => st.bookings.find(x => x.id === id);
  switch (b.op) {
    case 'confirm': {
      const r = find(b.id); if (!r) return json({ ok: false, msg: 'ჯავშანი ვერ მოიძებნა' });
      const room = b.room || bestRoom(st, r.type, r.from, r.to);
      if (!room || !roomFree(st, room, r.from, r.to, r.id)) return json({ ok: false, msg: 'ამ თარიღებზე ' + (st.types[r.type]?.name || '') + ' ნომერი თავისუფალი აღარ არის' });
      // the price is fixed at confirmation, so later rate changes do not move it
      await db.prepare("UPDATE bookings SET room=?, status='confirmed', price=COALESCE(price, ?) WHERE id=? AND status='pending'").bind(room, quote(st, r.type, r.from, r.to, r.guests), r.id).run();
      return json({ ok: true, room });
    }
    case 'decline':
      await db.prepare("UPDATE bookings SET status='declined' WHERE id=?").bind(b.id).run();
      return json({ ok: true });
    case 'remove':
      await db.batch([db.prepare('DELETE FROM bookings WHERE id=?').bind(b.id), db.prepare('DELETE FROM payments WHERE booking=?').bind(b.id)]);
      return json({ ok: true });
    case 'add': {
      const room = st.rooms.find(r => r.id === b.room);
      if (!room || !isDate(b.from) || !isDate(b.to) || b.to <= b.from) return json({ ok: false, msg: 'შეამოწმეთ ნომერი და თარიღები' });
      if (!roomFree(st, room.id, b.from, b.to)) return json({ ok: false, msg: 'ნომერი ' + room.id + ' ამ თარიღებზე დაკავებულია' });
      const g = parseInt(b.guests) || 2, price = b.price === '' || b.price == null ? quote(st, room.type, b.from, b.to, g) : Math.max(0, Math.round(+b.price || 0));
      await db.prepare('INSERT INTO bookings (id,room,type,date_from,date_to,guests,name,phone,status,source,created,price) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
        .bind(uid(), room.id, room.type, b.from, b.to, g, String(b.name || '').slice(0, 80), String(b.phone || '').slice(0, 30), 'confirmed', 'admin', new Date().toISOString(), price).run();
      return json({ ok: true });
    }
    case 'rates': {
      if (!st.types[b.type] || !Array.isArray(b.rates)) return json({ ok: false, msg: 'bad type' });
      const clean = b.rates.map(r => ({ guests: Math.max(1, parseInt(r.guests) || 1),
        price: Object.fromEntries(['peak', 'winter', 'summer', 'off'].map(k => [k, Math.max(0, Math.round(+r.price?.[k] || 0))])) }))
        .sort((x, y) => x.guests - y.guests);
      await db.prepare('UPDATE types SET rates=? WHERE id=?').bind(JSON.stringify(clean), b.type).run();
      return json({ ok: true });
    }
    case 'price': {
      if (!find(b.id)) return json({ ok: false, msg: 'ჯავშანი ვერ მოიძებნა' });
      await db.prepare('UPDATE bookings SET price=? WHERE id=?').bind(Math.max(0, Math.round(+b.price || 0)), b.id).run();
      return json({ ok: true });
    }
    case 'pay': {
      const amount = Math.round(+b.amount || 0);
      if (!find(b.booking)) return json({ ok: false, msg: 'ჯავშანი ვერ მოიძებნა' });
      if (!amount || Math.abs(amount) > 1e7) return json({ ok: false, msg: 'ჩაწერეთ თანხა' });
      if (!['card', 'transfer', 'cash'].includes(b.method)) return json({ ok: false, msg: 'აირჩიეთ გადახდის ხერხი' });
      await db.prepare('INSERT INTO payments (id,booking,amount,method,date,created) VALUES (?,?,?,?,?,?)')
        .bind(String(b.id || uid()).slice(0, 20), b.booking, amount, b.method, isDate(b.date) ? b.date : today(), new Date().toISOString()).run();
      return json({ ok: true });
    }
    case 'unpay':
      await db.prepare('DELETE FROM payments WHERE id=?').bind(b.id).run();
      return json({ ok: true });
    case 'setting': {
      if (!['seasonMode', 'winterFrom', 'winterTo', 'gapDiscount'].includes(b.k)) return json({ ok: false, msg: 'bad setting' });
      await db.prepare('INSERT INTO settings (k,v) VALUES (?,?) ON CONFLICT(k) DO UPDATE SET v=excluded.v').bind(b.k, String(b.v).slice(0, 10)).run();
      return json({ ok: true });
    }
  }
  return json({ ok: false, msg: 'unknown op' }, 400);
}
