#!/usr/bin/env python3
"""
Generate sample products for PolyBazar
Generates 100 realistic polymer product listings
"""

import json
import random
from datetime import datetime, timedelta
import uuid

# Polymer categories and types
POLYMERS = {
    "Polypropylene": {
        "types": ["Homopolymer", "Copolymer", "Random Copolymer", "Impact Copolymer"],
        "grades": ["Injection Molding", "Extrusion", "Fiber", "Film", "BOPP"],
        "brands": ["Reliance", "IOCL", "HPCL", "ONGC", "BPCL", "SABIC", "LyondellBasell"],
        "price_range": (100, 160),
        "mfi_range": (1, 50),
    },
    "Polyethylene": {
        "types": ["HDPE", "LDPE", "LLDPE"],
        "grades": ["Blow Molding", "Injection Molding", "Film Grade", "Pipe Grade", "Rotomolding"],
        "brands": ["Reliance", "IOCL", "GAIL", "ONGC", "ExxonMobil", "Dow"],
        "price_range": (90, 150),
        "mfi_range": (0.3, 30),
    },
    "PVC": {
        "types": ["Rigid PVC", "Flexible PVC", "CPVC"],
        "grades": ["Pipe Grade", "Cable Grade", "Sheet Grade", "Profile"],
        "brands": ["Finolex", "Chemplast", "DCW", "Reliance"],
        "price_range": (75, 130),
        "mfi_range": None,
    },
    "PET": {
        "types": ["Bottle Grade", "Fiber Grade", "Film Grade"],
        "grades": ["Virgin", "Recycled", "Food Grade"],
        "brands": ["Reliance", "IOCL", "JBF", "Indorama"],
        "price_range": (65, 120),
        "mfi_range": None,
    },
    "Polystyrene": {
        "types": ["GPPS", "HIPS", "EPS"],
        "grades": ["Injection Molding", "Extrusion", "Sheet"],
        "brands": ["INEOS", "Supreme", "LG Chem", "BASF"],
        "price_range": (120, 180),
        "mfi_range": (2, 25),
    },
    "ABS": {
        "types": ["General Purpose", "High Impact", "Heat Resistant", "Flame Retardant"],
        "grades": ["Injection Molding", "Extrusion", "Automotive", "Electronics"],
        "brands": ["LG Chem", "SABIC", "Chi Mei", "Kumho"],
        "price_range": (150, 230),
        "mfi_range": (5, 50),
    },
    "Engineering Plastics": {
        "types": ["Polycarbonate", "Nylon 6", "Nylon 66", "POM", "PBT"],
        "grades": ["General Purpose", "Glass Filled", "Flame Retardant", "High Flow"],
        "brands": ["SABIC", "DuPont", "BASF", "Lanxess", "Covestro"],
        "price_range": (180, 350),
        "mfi_range": (5, 60),
    },
}

FORMS = ["Granules", "Pellets", "Powder", "Flakes", "Regrind"]
COLORS = ["Natural", "White", "Black", "Transparent", "Custom"]
ORIGINS = ["India", "Saudi Arabia", "South Korea", "China", "USA", "Germany", "Thailand"]

CITIES = [
    ("Mumbai", "Maharashtra"),
    ("Delhi", "Delhi"),
    ("Ahmedabad", "Gujarat"),
    ("Chennai", "Tamil Nadu"),
    ("Kolkata", "West Bengal"),
    ("Bangalore", "Karnataka"),
    ("Hyderabad", "Telangana"),
    ("Pune", "Maharashtra"),
    ("Surat", "Gujarat"),
    ("Vadodara", "Gujarat"),
    ("Jaipur", "Rajasthan"),
    ("Ludhiana", "Punjab"),
]

SELLERS = [
    {"id": "seller-001", "name": "Polymer Trading Co.", "company": "Polymer Trading Co. Pvt Ltd", "verified": True},
    {"id": "seller-002", "name": "PlastiWorld India", "company": "PlastiWorld India LLP", "verified": True},
    {"id": "seller-003", "name": "ResinMart", "company": "ResinMart Enterprises", "verified": True},
    {"id": "seller-004", "name": "ChemSupply Hub", "company": "ChemSupply Hub Pvt Ltd", "verified": False},
    {"id": "seller-005", "name": "PolymerZone", "company": "PolymerZone Industries", "verified": True},
    {"id": "seller-006", "name": "PlasticPro", "company": "PlasticPro Trading", "verified": False},
    {"id": "seller-007", "name": "IndiaResins", "company": "IndiaResins Pvt Ltd", "verified": True},
    {"id": "seller-008", "name": "GlobalPolymers", "company": "Global Polymers India", "verified": True},
    {"id": "seller-009", "name": "PetroPlast", "company": "PetroPlast Chemicals", "verified": False},
    {"id": "seller-010", "name": "PolyTrade India", "company": "PolyTrade India LLP", "verified": True},
]


def generate_product(index):
    category = random.choice(list(POLYMERS.keys()))
    polymer_info = POLYMERS[category]
    
    polymer_type = random.choice(polymer_info["types"])
    grade = random.choice(polymer_info["grades"])
    brand = random.choice(polymer_info["brands"])
    form = random.choice(FORMS)
    color = random.choice(COLORS)
    origin = random.choice(ORIGINS)
    city, state = random.choice(CITIES)
    seller = random.choice(SELLERS)
    
    base_price = random.uniform(*polymer_info["price_range"])
    # Grade adjustments
    if "Recycled" in grade or "Regrind" in form:
        base_price *= 0.7
    elif "Food Grade" in grade or "Flame Retardant" in grade:
        base_price *= 1.15
    
    price = round(base_price, 2)
    
    min_qty = random.choice([100, 250, 500, 1000, 2000])
    available_qty = random.randint(min_qty, min_qty * 10)
    
    # Generate specs
    specs = {
        "applications": random.choice([
            "Packaging, Containers, Bottles",
            "Automotive Parts, Electronics",
            "Pipes, Fittings, Profiles",
            "Films, Sheets, Thermoforming",
            "Fibers, Textiles, Ropes",
            "Injection Molding, Consumer Goods",
        ]),
        "certifications": random.choice([
            "ISO 9001:2015",
            "ISO 9001:2015, FDA Approved",
            "BIS Certified",
            "ISO 9001:2015, BIS Certified",
            None,
        ]),
    }
    
    if polymer_info["mfi_range"]:
        mfi = round(random.uniform(*polymer_info["mfi_range"]), 1)
        specs["mfi"] = f"{mfi} g/10min"
    
    specs["density"] = f"{round(random.uniform(0.9, 1.4), 2)} g/cm³"
    
    # Generate title
    title = f"{brand} {category} {polymer_type} {grade}"
    if "Recycled" in grade:
        title = f"Recycled {category} {polymer_type} - {brand}"
    
    # Generate description
    description = f"""Premium quality {category} ({polymer_type}) available for immediate dispatch. 
    
Grade: {grade}
Brand: {brand}
Form: {form}
Color: {color}
Origin: {origin}

Ideal for {specs['applications'].lower()}. 

Minimum Order: {min_qty} KG
Available Stock: {available_qty} KG

Contact us for bulk pricing and customization options. Fast shipping available across India."""

    # Random image URLs (placeholder)
    num_images = random.randint(1, 4)
    images = [
        f"https://images.polybazar.com/products/{category.lower().replace(' ', '-')}-{i+1}.jpg"
        for i in range(num_images)
    ]
    
    # Random creation date within last 30 days
    days_ago = random.randint(0, 30)
    created_at = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
    
    product = {
        "_id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "category": category,
        "type": polymer_type,
        "grade": grade,
        "brand": brand,
        "form": form,
        "color": color,
        "origin": origin,
        "price": {"$numberDecimal": str(price)},
        "currency": "INR",
        "priceUnit": "per KG",
        "minOrderQuantity": {"$numberDecimal": str(min_qty)},
        "availableQuantity": {"$numberDecimal": str(available_qty)},
        "quantityUnit": "KG",
        "images": images,
        "primaryImage": images[0],
        "sellerId": seller["id"],
        "sellerName": seller["name"],
        "sellerCompany": seller["company"],
        "sellerVerified": seller["verified"],
        "location": {
            "city": city,
            "state": state,
            "country": "India",
            "pincode": str(random.randint(100000, 999999)),
        },
        "specs": specs,
        "status": "ACTIVE",
        "featured": random.random() < 0.1,  # 10% featured
        "negotiable": random.random() < 0.7,  # 70% negotiable
        "viewCount": random.randint(10, 500),
        "inquiryCount": random.randint(0, 20),
        "createdAt": {"$date": created_at.isoformat() + "Z"},
        "updatedAt": {"$date": created_at.isoformat() + "Z"},
    }
    
    return product


def main():
    products = [generate_product(i) for i in range(100)]
    
    # Output as JSON for mongoimport
    with open("sample_products.json", "w") as f:
        for product in products:
            f.write(json.dumps(product) + "\n")
    
    print(f"Generated {len(products)} sample products")
    print("Import with: mongoimport --db polybazar --collection products --file sample_products.json")
    
    # Also output category statistics
    categories = {}
    for p in products:
        cat = p["category"]
        categories[cat] = categories.get(cat, 0) + 1
    
    print("\nCategory distribution:")
    for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")


if __name__ == "__main__":
    main()
