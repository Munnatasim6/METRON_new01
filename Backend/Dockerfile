# Python 3.12 Slim ব্যবহার করছি (pandas_ta এর জন্য প্রয়োজন)
FROM python:3.12-slim

WORKDIR /app

# লাইব্রেরি ইন্সটল
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# কোড কপি (ডেভেলপমেন্টের জন্য ভলিউম মাউন্ট হবে, তবুও কপি রাখা ভালো)
COPY . .

# সার্ভার রান কমান্ড (Reload অন করা, যাতে কোড পাল্টালে সার্ভার রিস্টার্ট নেয়)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
