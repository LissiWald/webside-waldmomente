import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "lib"))

import beats
import caption
import detect
import hookscore
import humanize
import swipe


class HookScoreTests(unittest.TestCase):
    def test_concrete_hook_beats_a_vague_one(self):
        strong = hookscore.score_hook("I lost 600 euro and 2 invoices on a missing due date.")
        vague = hookscore.score_hook("Content strategy matters a lot these days for brands.")
        self.assertGreater(strong["score"], vague["score"])
        self.assertEqual(strong["band"], "STRONG")
        self.assertEqual(vague["band"], "WEAK")
        self.assertIn("specificity", strong["parts"])

    def test_ordinal_keeps_a_specific_hook_out_of_weak(self):
        scored = hookscore.score_hook(
            "Niemand sagt dir, dass die zweite Mahnung ruhiger sein muss.",
            "de",
        )
        self.assertGreaterEqual(scored["parts"]["specificity"], 62)
        self.assertNotEqual(scored["band"], "WEAK")
        self.assertEqual(scored["formula"]["id"], "quiet-rule")

    def test_spoken_number_counts_in_german(self):
        scored = hookscore.score_hook("Ich habe drei Verträge verloren und zwei Mahnungen ohne Frist verschickt.", "de")
        self.assertGreaterEqual(scored["parts"]["specificity"], 84)
        self.assertEqual(scored["formula"]["id"], "costly-miss")

    def test_greeting_and_attention_beg_are_capped(self):
        greeting = hookscore.score_hook("Hey guys, I lost 600 euro on one invoice.")
        begging = hookscore.score_hook("Stop scrolling if you want a calmer second reminder.")
        self.assertLessEqual(greeting["score"], 22)
        self.assertEqual(greeting["dealbreaker"]["id"], "greeting")
        self.assertEqual(begging["dealbreaker"]["id"], "attention-beg")
        self.assertEqual(begging["band"], "WEAK")

    def test_formula_abstains_when_nothing_matches(self):
        scored = hookscore.score_hook("My morning at the bench was ordinary and quiet.")
        self.assertIsNone(scored["formula"])

    def test_formula_names_a_clear_pattern(self):
        scored = hookscore.score_hook("Nobody mentions that the second reminder should sound calmer.")
        self.assertEqual(scored["formula"]["id"], "quiet-rule")

    def test_weak_signals_are_labeled(self):
        scored = hookscore.score_hook("I lost 600 euro and 2 invoices on a missing due date.")
        self.assertEqual(scored["weak_signals"], ["stakes", "address"])


class BeatTests(unittest.TestCase):
    def test_flags_long_hook_long_beat_and_missing_loop(self):
        script = "\n".join([
            "I lost 600 euro because the deposit never made the invoice at all.",
            "The page stayed blank while we talked about the weather outside.",
            "Nothing in the folder named a date.",
            "The counter was clear.",
            "We closed the shop.",
        ])
        sheet = beats.beat_sheet(script, target=30)
        joined = " ".join(sheet["flags"])
        self.assertIn("Hook runs past 3s", joined)
        self.assertIn("does not return", joined)
        self.assertFalse(sheet["loops"])

    def test_flags_a_beat_past_four_seconds(self):
        script = "\n".join([
            "I lost 600 euro.",
            "The invoice on the counter had no due date and no deposit line and no name for the person who picked it up.",
            "That missing line was the 600 euro.",
        ])
        sheet = beats.beat_sheet(script, target=12)
        self.assertTrue(any("runs" in flag and "Beat 2" in flag for flag in sheet["flags"]))

    def test_loop_and_shortfall(self):
        script = "\n".join([
            "I lost 600 euro.",
            "The deposit line was blank.",
            "That line was the 600 euro.",
        ])
        sheet = beats.beat_sheet(script, target=30)
        self.assertTrue(sheet["loops"])
        self.assertTrue(any("under" in flag for flag in sheet["flags"]))
        self.assertLess(sheet["seconds"], 30)


class CaptionTests(unittest.TestCase):
    def test_feed_window_hashtags_and_asks(self):
        body = (
            "I lost 600 euro because the deposit never reached the invoice, "
            "and the pickup note was still blank when the client arrived at the counter. "
            "Comment the word DATE and follow the series. "
            "#invoice #deposit #counter #pickup #friday #shop"
        )
        report = caption.lint_caption(body, ["due date", "deposit"])
        self.assertEqual(len(report["preview"]), 125)
        self.assertTrue(report["cut"])
        by_id = {item["id"]: item for item in report["checks"]}
        self.assertEqual(by_id["hashtags"]["status"], "FAIL")
        self.assertEqual(by_id["one_ask"]["status"], "WARN")
        self.assertEqual(by_id["search_terms"]["status"], "WARN")
        self.assertIn("due date", by_id["search_terms"]["detail"])
        self.assertEqual(by_id["concrete"]["status"], "PASS")


class HumanizeTests(unittest.TestCase):
    def test_cleans_marks_and_stock_words_without_rewriting_shape(self):
        draft = "Let's delve into the till\u200b — it's not just a note, it's a date."
        cleaned, changes = humanize.humanize(draft, "en")
        self.assertNotIn("\u200b", cleaned)
        self.assertNotIn("—", cleaned)
        self.assertNotIn("delve", cleaned.lower())
        self.assertIn("not just", cleaned.lower())
        kinds = {change["kind"] for change in changes}
        self.assertIn("invisible", kinds)
        self.assertIn("typography", kinds)
        self.assertIn("lexicon", kinds)
        again, more = humanize.humanize(cleaned, "en")
        self.assertEqual(again, cleaned)
        self.assertEqual(more, [])

    def test_german_stock_phrase_is_replaced(self):
        cleaned, _changes = humanize.humanize(
            "In der heutigen Zeit. Hört auf zu scrollen und schaut in die Kasse.",
            "de",
        )
        self.assertNotIn("heutigen Zeit", cleaned)
        self.assertNotIn("scrollen", cleaned.lower())


class DetectTests(unittest.TestCase):
    def test_humanize_moves_the_score_up(self):
        draft = "Let's delve into the till — follow for more and leverage the process."
        cleaned, _changes = humanize.humanize(draft, "en")
        before = detect.score_text(draft, "en")
        after = detect.score_text(cleaned, "en")
        self.assertGreater(after["score"], before["score"])
        self.assertLess(before["parts"]["fingerprint"][0], 100)

    def test_structural_tell_survives_cleaning(self):
        draft = "It's not just a caption, it's a strategy for the counter."
        cleaned, _changes = humanize.humanize(draft, "en")
        report = detect.score_text(cleaned, "en")
        self.assertIn("not-just", {tell["id"] for tell in report["tells"]})


class SwipeTests(unittest.TestCase):
    def test_ranks_by_account_multiple_not_raw_views(self):
        text = "\n".join([
            "account\tbaseline\tviews\thook\tsends\treach",
            "@big\t1000000\t1200000\tMy morning at the bench was ordinary and quiet.\t10\t1000",
            "@small\t2000\t80000\tNobody mentions that the second reminder should sound calmer.\t40\t200",
            "@mid\t10000\t11000\tThe counter was dusty.\t1\t500",
        ])
        report = swipe.rank_rows(swipe.load_rows(text))
        self.assertEqual(report["rows"][0]["account"], "@small")
        self.assertAlmostEqual(report["rows"][0]["multiple"], 40.0)
        self.assertEqual(report["rows"][0]["formula"]["id"], "quiet-rule")
        self.assertIsNone(report["rows"][1]["formula"] or report["rows"][2]["formula"])
        self.assertGreater(report["rows"][0]["multiple"], report["rows"][-1]["multiple"])
        self.assertAlmostEqual(report["rows"][0]["sends_per_reach"], 0.2)

    def test_abstains_when_the_hook_has_no_formula(self):
        text = "\n".join([
            "account,baseline,views,hook",
            "@bench,100,130,My morning at the bench was ordinary and quiet.",
        ])
        report = swipe.rank_rows(swipe.load_rows(text))
        self.assertIsNone(report["rows"][0]["formula"])


if __name__ == "__main__":
    unittest.main()
