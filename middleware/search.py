import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from konlpy.tag import Kkma
from konlpy.utils import pprint

kkma = Kkma()

pprint(kkma.pos(sys.argv[1]))
