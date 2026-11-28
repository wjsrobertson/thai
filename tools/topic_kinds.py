"""Topics are word lists or phrases, never both (the user's call, 2026-11-14): a topic of phrases has
`"phrases": true` in data/decks.json, and Vocabulary leaves it out. This says which cards look out of
place in their topic, so a new card goes in a topic of its kind.

    python3 -u tools/topic_kinds.py report     # topics with a card of the other kind, and what it is

A card's kind (`card_kind`):
- **word:** one word, a compound (ห้องน้ำ, สีแดง, วันหยุดยาว), a doubled word (เรื่อย ๆ), a "to …" verb
  or collocation (สั่งอาหาร "to order food"), a set chunk that works as one word (อาจจะ, ยังไม่, ใช่ไหม,
  ไม่เป็นไร), or a one-word reply (ใช่, โอเค, ฮัลโหล): what you'd look up as a word.
- **phrase:** said as a whole and built from words: a sentence, question, request, greeting, reply or
  exclamation (ขอบคุณมาก, สบายดีไหม, ใช่เลย), a sign or instruction (ห้ามเข้า), a time, date, duration
  or counted noun (หกโมงเช้า, สองชั่วโมง, หนังสือเล่มนี้), an idiom, proverb or saying.
A guess from the card (`guess`: its `words` or a space, and an English gloss that reads as something
said), corrected by the cards reviewed by hand in the split (WORDS, PHRASES), by Thai or by its key.
Thai Script's topics (letters, tones and spelling) are neither and aren't checked.
"""
import re
import sys

import decks_io

# Built-up expressions: here a card of several words is a phrase (a time, a date, a count, a pattern).
BUILT_TOPICS = {'time-telling-day', 'time-telling-night', 'time-telling-minutes', 'time-saying-the-date', 'time-how-long',
                'classifiers-patterns', 'grammar-patterns-time', 'grammar-patterns-can-must',
                'grammar-patterns-make-let-get', 'grammar-patterns-linking'}
# Idioms and proverbs: a card of several words is a saying; one word is one of the sayings' words.
IDIOM_TOPICS = {'cul-idioms', 'cul-idioms-idioms-proverbs-people-behaviour', 'cul-idioms-work-effort-luck',
                'cul-idioms-talk-relationships', 'south-idioms',
                'cul-idioms-animals', 'cul-idioms-caution-effort', 'cul-idioms-talk-character'}  # 2026-11-28

# Reviewed by hand (2026-11-14). A Thai, or a "thai::english" key where the Thai has other senses.
WORDS = {w.replace('_', ' ') for w in '''ราตรีสวัสดิ์ เรื่อย_ๆ ขอให้ สู้_ๆ เอา สวัสดิ์ ไม่ดี กี่โมง เที่ยง โมง นาฬิกา สิบสี่ พุทธศักราช คริสต์ศักราช
ต้นเดือน กลางเดือน ปลายเดือน สิ้นปี วันหยุดยาว อีกไม่นาน นานแล้ว ไม่นานมานี้ ทั้งวัน ทั้งคืน ครึ่งวัน ตลอดทั้งปี หรือยัง สนิท
น่าสนใจ เหมือนกัน อาจจะ ไม่น่าเชื่อ เสียดาย คุ้ม โอเค ตกลง เชิญ ยินดี ใช่ แป๊บ โชค ช่าง ชวน เลื่อนนัด ยกเลิก วันหลัง ความลับ
เฉย_ๆ ฮัลโหล โทรกลับ ฝากข้อความ เบอร์โทร ไลน์ แอดไลน์ อ่านแล้วไม่ตอบ ดัง สัญญาณ หลุด แอด สักครู่ ล้อเล่น ถ้าอย่างนั้น ไม่งั้น
ว่าแต่ หมายความว่า อย่างนั้น อย่างนี้ แบบนี้ อยู่แล้ว ก่อนอื่น รึเปล่า อีกแล้ว หมายถึง ความหมาย คำศัพท์ ศัพท์สแลง ภาษาพูด
ภาษาเขียน ภาษาทางการ จดไว้ อ่านไม่ออก แปลว่า อันเดียว ทุกคน บางคน ยังไม่ ไม่เลย ไม่ต้อง ใช่ไหม แค่ไหน ได้ไหม ไม่เกิน ไม่พอ
อนาคต รู้เรื่อง ติดธุระ โทรไม่ติด ไม่เป็นไร จั่งได๋ มีความสุข หน้าตาดี ฉลากเบอร์_5 กี่บาท ไม่มี ราคาสุดท้าย ราคาเดียว แถม
ของขวัญ ลูกค้าประจำ ยิ้ม ประจำ กี่ชั่วโมง ตรงไป ขออภัย ไม่สะดวก วาระแรก ติดตามผล สรุปการประชุม รายงานการประชุม ปิดประชุม
เข้าประชุม ติดประชุม เสนอ เสริม นิด แย้ง ภายใน แจ้งปัญหา ร้องเรียน คืนเงิน เปลี่ยนสินค้า รับประกัน ฝ่ายบริการลูกค้า คอลเซ็นเตอร์
ความพึงพอใจ สินค้า พึงพอใจ ดำเนินการ หายใจไม่ออก นอนไม่หลับ เพนิซิลลิน สายตา อ้า ลึกๆ ร้ายแรง ภาวะ แทรกซ้อน
อภิปรายไม่ไว้วางใจ เมื่อคืนนี้ ไม่เท่ากับ สั่งอาหาร กินที่นี่ ใส่กล่อง แยกถุง กินเจ ฮาลาล เลี้ยง แยกจ่าย คิดเงิน บิล มื้อ
เมนู ถั่ว มังสวิรัติ แยก ช้อนส้อม เว้าอีสาน แหลงใต้ บ่ายดี พันพรือ ม่าย แขบๆ หลบบ้าน หม้าย บ่าว หยอก นิ หม่า…แหม่ะ ทุ่ม ดึก
เอาเป็นว่า ดูเหมือนว่า แสดงว่า หรือไง ก็ได้'''.split()}
PHRASES = {w.replace('_', ' ') for w in '''ขอบคุณมาก ยินดีที่ได้รู้จัก สบายดีไหม เป็นไงบ้าง ทานให้อร่อยนะ แพงไป ดูเฉย_ๆ สีอะไร ทำจากอะไร ตอนกี่โมง
แล้วแต่ ตามใจ ไม่แน่เหมือนกัน ใช่เลย ดีเลย ได้เลย เข้าใจแล้ว อะไรก็ได้ ตามสบาย ไว้วันหลังนะ ไว้คราวหน้า คงไม่ได้
ไปธุระ::on_an_errand_/_on_business ไปเที่ยว::out_and_about_/_going_out_(for_fun) แถวนี้แหละ ก็งั้น_ๆ ประมาณนั้น สัญญาณไม่ดี
สายหลุด โทรหาหน่อย จำไว้ เอาล่ะ พอที พอกันที เชื่อเถอะ ไม่เลว ช่วยไม่ได้ คำนี้ ไม่เข้าใจ เหมือนแต่ไม่เหมือน เสร็จแล้ว
พรุ่งนี้จะไปทะเล แม่ให้ไปซื้อของ เขียนให้ชัด_ๆ ม่ารู่ม้าย ม่ายพรือ หรอยแรง สวยหนัด แลดี แข๊บหม้าย มาต่ะ พันพรือหล้าว
ขอบใจหลาย_ๆ แซ่บหลาย ขอบคุณเจ้า กิ๋นข้าวแล้วกา ยะหยัง บ่เป็นหยัง ลำแต้ ไม่มีอะไร เป็นอะไรไหม ไหวไหม ไม่ต้องเกรงใจ
เก่งมาก สวยจัง หล่อมาก พูดไทยเก่ง ไม่ขนาดนั้น ชมเกินไป ดีขึ้นแล้ว มีแฟนยัง เจ็บแต่จบ ไม่เป็นไรนะ ห้ามจับหัว ขอทาง
ห้ามวิจารณ์สถาบัน กินข้าวยัง ไปไหนมา น้องครับ เรียกว่าอะไรดี ห้ามถ่ายรูป ห้ามเข้า ทำดีได้ดี_ทำชั่วได้ชั่ว ทำดีแล้วไม่ได้ดี
ไม่เผ็ด ไม่ใส่ผงชูรส ไม่ใส่ผัก ไม่ใส่พริก ไม่หวาน ห้ามทิ้งกระดาษลงชักโครก นอนไม่พอ มีแขกมา น้ำไม่ไหล ลดได้ไหม ขอลดหน่อย
มีไหม ขอดูหน่อย ลองได้ไหม ไม่เอา ไม่เอาถุง ที่อื่นขาย…บาท ขอ…บาท เอาก็เอา ถึงไหนแล้ว รออยู่หน้า ไม่ต้องใส่ช้อนส้อม เจ็บไหม
เสร็จเมื่อไหร่ มารับวันไหน รอเรียกชื่อ ใช้เวลากี่วัน กลับมาใหม่พรุ่งนี้ ใช้เวลานานเท่าไหร่ อยู่ที่ไหน บอกทางได้ไหม ห้ามสูบบุหรี่
ห้ามจอด ห้ามทิ้งขยะ ห้ามรบกวน เปิดกี่โมง ปิดกี่โมง ถ่ายรูปได้ไหม มาจากไหน พูดได้กี่ภาษา ทำอะไร::what_do_you_do?_(for_work)
ขอบคุณล่วงหน้า ขออภัยในความไม่สะดวก หวังเป็นอย่างยิ่งว่า ขอตัวก่อน รบกวนหน่อย ภายในวันศุกร์ ช่วยด้วย เป็นตั้งแต่เมื่อวาน
ฉันกินยา…ประจำ หายใจเข้าลึกๆ นอนลงตรงนี้ อ้าปาก เมื่อมีอาการ ห้ามรับประทาน อาจทำให้ง่วงซึม มานี่ เกิดปีอะไร
วันนี้อากาศเป็นยังไง ชอบทำอะไร ระวังคลื่น เปิดดังๆ เสียงดังไป ฟังเพลงอะไร เรียกรถพยาบาล มีคนทำร้ายฉัน ผู้ชายใส่เสื้อสีดำ
ขี่มอเตอร์ไซค์ ขอดูใบขับขี่หน่อย ไม่มีใบขับขี่ ไม่สวมหมวกกันน็อก เป็นไง ไม่เป็นไร::no_thanks_(declining_an_offer) ขโมย::thief!'''.split()}

SAID = re.compile(r"([?!]\)?$|,? please\)?$|^\(?(I|I'm|I'll|I've|I'd|we|we're|we'll|you|you're|you'll|it|it's|it'll|let's|let me"
                  r"|can|could|may|please|don't|do|does|did|is|are|was|were|will|would|shall|should|what|what's|where|where's"
                  r"|how|how's|who|who's|when|why|which|that's|this is|there's|there|he|she|he's|she's|they|they're|my|your"
                  r"|his|her|our|their|not|no|never|thank|thanks|sorry|excuse me|see you|happy|merry|congratulations|welcome"
                  r"|good|have a|take care|get well|long time|nice to|cheers|hurry|stop|help|wait|hang on|come|go|get|sit"
                  r"|stand|look|listen|watch out|be careful|calm down|enough|same|so|oh|wow|really|any)\b)", re.I)


def several(card):
    """Built from more than one word: the story builder's `words`, or a space (a doubled word's ๆ aside)."""
    return len(card.get('words') or []) > 1 or ' ' in card['thai'].replace(' ๆ', 'ๆ')


def guess(card, topic_id):
    english = card['english'].strip()
    if topic_id in IDIOM_TOPICS:
        return 'phrase' if several(card) or len(card['thai']) > 9 else 'word'
    if not several(card):
        return 'word'
    if topic_id in BUILT_TOPICS:
        return 'phrase'
    if re.match(r'^\(?to\b', english) and not english.endswith('?'):
        return 'word'  # to order food: a collocation
    return 'phrase' if SAID.search(english) else 'word'


def card_kind(card, topic_id):
    k = decks_io.key(card)
    for probe in (k, card['thai']):  # a "thai::english" key wins over the Thai alone
        for hand, kind in ((WORDS, 'word'), (PHRASES, 'phrase')):
            if probe in hand:
                return kind
    return guess(card, topic_id)


def topics(data):
    """The topics checked: not stories, not Thai Script's."""
    return [t for t in data['decks'] if not decks_io.is_story(t) and t['category'] != 'Thai Script']


def report():
    data = decks_io.load()
    out = 0
    for t in topics(data):
        kind = 'phrase' if t.get('phrases') else 'word'
        odd = [c for c in t['cards'] if card_kind(c, t['id']) != kind]
        if odd:
            out += 1
            print(f"{t['name']} ({'phrases' if kind == 'phrase' else 'words'}): " + '; '.join(f"{c['thai']} {c['english']}" for c in odd))
    print(f'{out} topics with a card of the other kind' if out else 'Every topic is all words or all phrases.')
    return 0


if __name__ == '__main__':
    if sys.argv[1:] == ['report']:
        sys.exit(report())
    print(__doc__)
    sys.exit(2)
