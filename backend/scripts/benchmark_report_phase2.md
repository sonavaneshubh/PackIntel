# PackIntel · Phase 2 Benchmark Report

- Date: benchmark_report_phase2.md run  (`C:\Users\91914\Desktop\SIH project\PackIntel\backend\scripts\benchmark_phase2.py`)
- Labels: 10 synthetic packaged-commodity labels (PIL-rendered)
- Vision model configured: NO (OCR-only results; merged = OCR)
- Field-level recall (all sources): **116 / 146 = 79.5%**

| # | Case | Brand | OCR conf | Vision | Result | Compliance | Recall |
|---|------|-------|----------|--------|--------|-----------|--------|
| 1 | basmati-rice | Harvest Gold | 90% | - | pass | 100/100 (risk 0) | 11/14 |
| 2 | whole-wheat-atta | Annapurna | 95% | - | pass | 100/100 (risk 0) | 13/15 |
| 3 | sweet-biscuits | NutriBite | 91% | - | pass | 100/100 (risk 0) | 11/15 |
| 4 | cola-bottle | CoolFizz | 95% | - | pass | 100/100 (risk 0) | 14/16 |
| 5 | mustard-oil | Sarson Gold | 91% | - | pass | 100/100 (risk 0) | 11/15 |
| 6 | potato-chips | Crunch | 88% | - | pass | 100/100 (risk 0) | 12/15 |
| 7 | tur-dal | Dhara | 88% | - | pass | 100/100 (risk 0) | 11/14 |
| 8 | tomato-ketchup | RedPepper | 89% | - | pass | 100/100 (risk 0) | 11/14 |
| 9 | tea-masala | Taj Masala | 90% | - | pass | 100/100 (risk 0) | 11/14 |
| 10 | atta-flour-low-contrast | Janata | 89% | - | pass | 100/100 (risk 0) | 11/14 |

## Field-level accuracy

| Field | Correct | Total | Recall | Notes |
|---|---|---|---|---|
| brand_or_commodity_name | 8 | 10 | 80% | sweet-biscuits:wrong ('NutriBite'), mustard-oil:wrong ('Mustard Oil') |
| generic_name | 10 | 10 | 100% |  |
| net_quantity | 10 | 10 | 100% |  |
| quantity_unit | 10 | 10 | 100% |  |
| manufacturer_name | 10 | 10 | 100% |  |
| packer_name | 1 | 1 | 100% |  |
| mrp | 10 | 10 | 100% |  |
| packing_date | 7 | 7 | 100% |  |
| manufacturing_date | 3 | 3 | 100% |  |
| expiry_date | 10 | 10 | 100% |  |
| batch_number | 10 | 10 | 100% |  |
| customer_care_phone | 10 | 10 | 100% |  |
| toll_free_number | 10 | 10 | 100% |  |
| customer_care_email | 1 | 1 | 100% |  |
| country_of_origin | 5 | 10 | 50% | basmati-rice:wrong ('India Ve ek'), tur-dal:wrong ('India Wy ek'), tomato-ketchup:wrong ('India Ve ek'), tea-masala:wron |
| vegetarian_mark | 0 | 9 | 0% | basmati-rice:missing, whole-wheat-atta:missing, sweet-biscuits:wrong ('Present'), cola-bottle:missing, mustard-oil:wrong |
| non_vegetarian_mark | 0 | 1 | 0% | potato-chips:wrong ('Present') |
| fssai_number | 0 | 10 | 0% | basmati-rice:missing, whole-wheat-atta:missing, sweet-biscuits:missing, cola-bottle:missing, mustard-oil:missing, potato |
| certifications | 0 | 3 | 0% | sweet-biscuits:missing, mustard-oil:missing, potato-chips:missing |

## Confidence and quality

| Case | OCR confidence | image quality |
|---|---|---|
| basmati-rice | 90.0% | normal |
| whole-wheat-atta | 94.6% | normal |
| sweet-biscuits | 91.0% | normal |
| cola-bottle | 94.6% | normal |
| mustard-oil | 91.0% | normal |
| potato-chips | 88.4% | normal |
| tur-dal | 88.1% | normal |
| tomato-ketchup | 89.2% | normal |
| tea-masala | 89.9% | normal |
| atta-flour-low-contrast | 89.2% | low contrast |
