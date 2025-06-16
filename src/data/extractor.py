import pdfplumber
import json
import re
import os

def extract_questions_to_json(pdf_path, json_path='data.json'):
    """
    PDF faylından çoxvariantlı sualları oxuyur və onları JSON faylına yazır.

    Bu ekstraktor müəyyən bir formatı nəzərdə tutur:
    - Hər sual nömrə və nöqtə ilə başlayır (məsələn, "700. ").
    - Hər variant xüsusi bir işarə ilə başlayır (məsələn, '•', 'a)', '-').
    - Düzgün cavab xüsusi bir işarə ilə qeyd olunur (məsələn, '√').
      Bu skript hazırda '√' ilə işarələnmiş cavabı tanıyır.

    PDF faylınızın formatına uyğun olaraq bu funksiyanın içindəki regular expression
    (regex) ifadələrini dəyişdirməyiniz lazım gələ bilər.
    """
    if not os.path.exists(pdf_path):
        print(f"Xəta: '{pdf_path}' faylı tapılmadı.")
        return

    # --- REGEX İFADƏLƏRİ (EHTİYAC OLARSA DƏYİŞDİRİN) ---
    # Sualın başlanğıcını müəyyən edir (məs: "700. Sualın mətni?")
    question_start_pattern = re.compile(r'^\s*(\d+)\.\s+(.*)')
    
    # Variant sətrini müəyyən edir.
    # '•', '√' kimi işarələri və ya 'a)', 'b)' kimi hərfləri axtarır.
    # Qrup 1: İşarə (məsələn, '√')
    # Qrup 2: Variantın mətni
    # Şəkildəki nümunəyə əsasən:
    option_pattern = re.compile(r'^\s*([•√])\s+(.*)') 

    questions_data = []
    current_question = None
    full_text = ""

    print(f"'{pdf_path}' faylı oxunur...")
    try:
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    full_text += page_text + "\n"
        print("Faylın oxunması tamamlandı. Mətn təhlil edilir...")

    except Exception as e:
        print(f"PDF faylını oxuyarkən xəta baş verdi: {e}")
        return

    lines = full_text.split('\n')

    for line in lines:
        line = line.strip()
        if not line:
            continue

        question_match = question_start_pattern.match(line)
        option_match = option_pattern.match(line)

        if question_match:
            # Yeni bir sual tapıldıqda, əvvəlki sualı siyahıya əlavə edirik
            if current_question and current_question["options"]:
                questions_data.append(current_question)

            # Yeni sual obyekti yaradırıq
            q_id = int(question_match.group(1))
            q_text = question_match.group(2).strip()
            current_question = {
                "id": q_id,
                "question": q_text,
                "options": [],
                "answer": ""
            }
        
        elif option_match and current_question:
            marker = option_match.group(1)
            option_text = option_match.group(2).strip()
            
            current_question["options"].append(option_text)
            
            # --- DÜZGÜN CAVABIN TAPILMASI MƏNTİQİ (EHTİYAC OLARSA DƏYİŞDİRİN) ---
            # Bu hissə düzgün cavabın '√' işarəsi ilə qeyd olunduğunu fərz edir.
            if marker == '√':
                current_question["answer"] = option_text

    # Döngü bitdikdən sonra ən son sualı da siyahıya əlavə edirik
    if current_question and current_question["options"]:
        questions_data.append(current_question)
    
    print(f"Təhlil tamamlandı. {len(questions_data)} sual tapıldı.")

    # Məlumatları JSON faylına yazırıq
    try:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(questions_data, f, ensure_ascii=False, indent=2)
        print(f"Məlumatlar uğurla '{json_path}' faylında saxlanıldı.")
    except Exception as e:
        print(f"JSON faylına yazarkən xəta baş verdi: {e}")


# --- SKRİPTİN İSTİFADƏ QAYDASI ---
if __name__ == '__main__':
    # Vacib: "sual_banki.pdf" yerinə öz PDF faylınızın adını yazın.
    pdf_file_path = "main.pdf" 
    
    # Çıxış faylının adını istəyə görə dəyişə bilərsiniz.
    json_file_path = "data.json"
    
    # Yoxlayırıq ki, fayl mövcuddurmu
    if not os.path.exists(pdf_file_path):
        print(f"\nXƏBƏRDARLIQ: '{pdf_file_path}' faylı tapılmadı.")
        print("Bu skriptin işləməsi üçün PDF faylını skript ilə eyni qovluqda yerləşdirməlisiniz.")
        print("Zəhmət olmasa, PDF faylınızın adını yoxlayıb skripti yenidən başladın.\n")
    else:
        extract_questions_to_json(pdf_file_path, json_file_path)