"""Legal document drafting.

Turns a few plain-language facts from the user into a clean, formal, ready-to-file
draft (police complaint / FIR, RTI application, consumer complaint, legal notice).
Unlike the Q&A pipeline this does not gate on retrieval — these are structured
drafts, and the value is in producing a correctly formatted document the user can
take to a police station, authority, or lawyer.
"""
import logging
from typing import Dict, List

from app.services.llm import get_llm

logger = logging.getLogger(__name__)

# Each template declares the fields we collect from the user and a focused
# instruction describing the document so the LLM produces a usable draft.
TEMPLATES: Dict[str, dict] = {
    "fir": {
        "name": "Police Complaint / FIR",
        "description": "A First Information Report to report a cognizable offence at a police station.",
        "fields": [
            {"key": "complainant", "label": "Your full name", "required": True},
            {"key": "address", "label": "Your address", "required": True},
            {"key": "phone", "label": "Your phone number", "required": False},
            {"key": "incident_datetime", "label": "Date & time of incident", "required": True},
            {"key": "incident_place", "label": "Place of incident", "required": True},
            {"key": "accused", "label": "Accused person(s), if known", "required": False},
            {"key": "details", "label": "What happened (in your own words)", "required": True},
        ],
        "instruction": (
            "Draft a formal First Information Report (FIR) / police complaint addressed to "
            "'The Station House Officer'. State the facts in clear chronological order, "
            "request that an FIR be registered, and ask for a copy of the FIR as is the "
            "complainant's right. Mention relevant Indian law only if you are confident it "
            "applies; otherwise omit specific sections."
        ),
    },
    "rti": {
        "name": "RTI Application",
        "description": "A Right to Information application to request records from a public authority.",
        "fields": [
            {"key": "applicant", "label": "Your full name", "required": True},
            {"key": "address", "label": "Your address", "required": True},
            {"key": "authority", "label": "Public authority / department", "required": True},
            {"key": "information", "label": "Information you want", "required": True},
            {"key": "period", "label": "Time period of records (if any)", "required": False},
        ],
        "instruction": (
            "Draft an application under the Right to Information Act, 2005 addressed to the "
            "'Public Information Officer' of the named authority. List the information sought "
            "as clearly numbered points. Note that the prescribed fee of Rs. 10 is enclosed, "
            "and request a response within the statutory 30 days."
        ),
    },
    "consumer": {
        "name": "Consumer Complaint",
        "description": "A complaint to a seller/service provider or consumer forum about a defective product or deficient service.",
        "fields": [
            {"key": "complainant", "label": "Your full name", "required": True},
            {"key": "address", "label": "Your address", "required": True},
            {"key": "opposite_party", "label": "Company / seller name & address", "required": True},
            {"key": "purchase_details", "label": "What you bought, when, and amount", "required": True},
            {"key": "problem", "label": "The defect / deficiency", "required": True},
            {"key": "relief", "label": "What you want (refund, replacement, compensation)", "required": True},
        ],
        "instruction": (
            "Draft a consumer complaint suitable under the Consumer Protection Act, 2019. "
            "Set out the transaction, the defect or deficiency in service, the loss suffered, "
            "and the specific relief sought. Keep a firm but polite tone and reference any "
            "bills/receipts as enclosures."
        ),
    },
    "legal_notice": {
        "name": "Legal Notice",
        "description": "A formal legal notice to another party demanding action before approaching a court.",
        "fields": [
            {"key": "sender", "label": "Your full name", "required": True},
            {"key": "sender_address", "label": "Your address", "required": True},
            {"key": "recipient", "label": "Recipient name & address", "required": True},
            {"key": "facts", "label": "Background facts / grievance", "required": True},
            {"key": "demand", "label": "What you are demanding", "required": True},
            {"key": "deadline", "label": "Deadline to comply (e.g. 15 days)", "required": False},
        ],
        "instruction": (
            "Draft a formal legal notice. State the facts and the cause of action, set out the "
            "specific demand, and give the recipient a reasonable deadline (default 15 days) to "
            "comply, failing which legal proceedings may follow. Keep it firm and professional."
        ),
    },
}

_DOC_PROMPT = """You are a careful legal drafting assistant for Indian law. Produce a \
clean, formal, ready-to-use {name} for the user.

{instruction}

Rules:
- Use ONLY the facts provided below. Do NOT invent names, dates, amounts, or events.
- Where a needed detail is missing, insert a clear placeholder in square brackets \
(for example [DATE], [POLICE STATION], [AMOUNT]) so the user can fill it in.
- Output plain text suitable for printing. Include a date line, "To" block, subject \
line, body, and a place for the user's signature and name.
- Write the document in {language}.

FACTS PROVIDED BY THE USER:
{facts}

DRAFT:"""


def list_templates() -> List[dict]:
    """Public catalogue of templates and the fields each needs."""
    return [
        {
            "id": template_id,
            "name": tmpl["name"],
            "description": tmpl["description"],
            "fields": tmpl["fields"],
        }
        for template_id, tmpl in TEMPLATES.items()
    ]


def generate_document(
    template_id: str,
    fields: Dict[str, str],
    language: str = "English",
) -> str:
    """Render a draft document for the given template and user-supplied facts."""
    template = TEMPLATES.get(template_id)
    if not template:
        raise ValueError(f"Unknown template: {template_id}")

    language = (language or "English").strip() or "English"
    labels = {f["key"]: f["label"] for f in template["fields"]}
    facts = "\n".join(
        f"- {labels.get(key, key)}: {value}"
        for key, value in fields.items()
        if value and str(value).strip()
    ) or "(no details provided)"

    prompt = _DOC_PROMPT.format(
        name=template["name"],
        instruction=template["instruction"],
        facts=facts,
        language=language,
    )
    return get_llm().generate(prompt, temperature=0.3)
