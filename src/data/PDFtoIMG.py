import fitz  # PyMuPDF
import os

# PDF dosyasını aç
pdf_document = fitz.open("Cs21EhtimalHack/Ehtimal.pdf")

# Output dizinini oluştur
output_dir = "Cs21EhtimalHack/output"
os.makedirs(output_dir, exist_ok=True)

# PDF'deki görüntüleri çıkarmak için bir liste
images = []

# Her sayfa için
for page_number in range(len(pdf_document)):
    page = pdf_document.load_page(page_number)
    # Sayfadaki görüntüleri bul
    image_list = page.get_images(full=True)
    for img in image_list:
        xref = img[0]
        base_image = pdf_document.extract_image(xref)
        image_bytes = base_image["image"]
        image_ext = base_image["ext"]
        images.append({
            "page": page_number,
            "xref": xref,
            "bytes": image_bytes,
            "ext": image_ext,
            "bbox": page.get_image_bbox(img)
        })

for img in images:
    image_file_name = f"extracted_image_{img['page']}_{img['xref']}.{img['ext']}"
    image_file_path = os.path.join(output_dir, image_file_name)
    with open(image_file_path, "wb") as image_file:
        image_file.write(img["bytes"])
    print(f"Extracted image from page {img['page']} with bbox {img['bbox']} saved as {image_file_path}")
