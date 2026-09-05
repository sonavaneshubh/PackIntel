from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field

ProductFieldStatus = Literal["detected", "not_printed", "not_visible", "uncertain"]
ProductFieldSource = Literal["ocr", "vision", "merged", "user", "none"]

# Canonical schema across OCR, vision and merged results. This is the single
# source of truth for the frontend and the compliance engine.
PRODUCT_FIELDS = (
    "brand_or_commodity_name",
    "generic_name",
    "net_quantity",
    "quantity_unit",
    "manufacturer_name",
    "manufacturer_address",
    "packer_name",
    "packer_address",
    "marketer_name",
    "marketer_address",
    "mrp",
    "mrp_tax_inclusive",
    "unit_sale_price",
    "packing_date",
    "manufacturing_date",
    "expiry_date",
    "batch_number",
    "customer_care_name",
    "customer_care_phone",
    "toll_free_number",
    "customer_care_email",
    "country_of_origin",
    "vegetarian_mark",
    "non_vegetarian_mark",
    "fssai_number",
    "certifications",
)

# Fields whose disagreement must never be silently resolved.
CONFLICT_SENSITIVE_FIELDS = (
    "mrp",
    "net_quantity",
    "packing_date",
    "manufacturing_date",
    "expiry_date",
    "fssai_number",
)


class ProductField(BaseModel):
    """Per-field extraction outcome.

    value      - printed value, or null when absent/unreadable (never invented)
    status     - detected | not_printed | not_visible | uncertain
    confidence - 0-100, real confidence from the producing source
    source     - ocr | vision | user | none
    conflicts  - optional debugging metadata when OCR and vision disagree
    """

    value: Optional[str] = None
    status: ProductFieldStatus = "not_visible"
    confidence: float = Field(default=0.0, ge=0.0, le=100.0)
    source: ProductFieldSource = "none"
    conflicts: Optional[List[Dict[str, Any]]] = None


def field(
    value: Optional[str] = None,
    status: str = "not_visible",
    confidence: float = 0.0,
    source: str = "none",
    conflicts: Optional[List[Dict[str, Any]]] = None,
) -> ProductField:
    return ProductField(
        value=value,
        status=status,  # type: ignore[arg-type]
        confidence=confidence,
        source=source,  # type: ignore[arg-type]
        conflicts=conflicts,
    )


class ProductInformation(BaseModel):
    """Canonical structured product-information schema (26 stable fields)."""

    brand_or_commodity_name: ProductField = field()
    generic_name: ProductField = field()
    net_quantity: ProductField = field()
    quantity_unit: ProductField = field()
    manufacturer_name: ProductField = field()
    manufacturer_address: ProductField = field()
    packer_name: ProductField = field()
    packer_address: ProductField = field()
    marketer_name: ProductField = field()
    marketer_address: ProductField = field()
    mrp: ProductField = field()
    mrp_tax_inclusive: ProductField = field()
    unit_sale_price: ProductField = field()
    packing_date: ProductField = field()
    manufacturing_date: ProductField = field()
    expiry_date: ProductField = field()
    batch_number: ProductField = field()
    customer_care_name: ProductField = field()
    customer_care_phone: ProductField = field()
    toll_free_number: ProductField = field()
    customer_care_email: ProductField = field()
    country_of_origin: ProductField = field()
    vegetarian_mark: ProductField = field()
    non_vegetarian_mark: ProductField = field()
    fssai_number: ProductField = field()
    certifications: ProductField = field()

    def as_dict(self) -> Dict[str, ProductField]:
        return {name: getattr(self, name) for name in PRODUCT_FIELDS}

    def model_dump_canonical(self) -> Dict[str, Dict[str, Any]]:
        return {name: getattr(self, name).model_dump() for name in PRODUCT_FIELDS}