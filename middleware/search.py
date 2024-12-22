import sys
import io
import json

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from konlpy.tag import Kkma

kkma = Kkma()

text=sys.argv[1]

result=kkma.pos(text)

print(json.dumps(result))
