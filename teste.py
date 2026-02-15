import math
import turtle as t

def hearta(k):
    return 15 * math.sin(k) ** 3

def heartb(k):
    return 13 * math.cos(k) - 5 *\
    math.cos(2 * k) - 2 *\
    math.cos(3 * k) - math.cos(4 * k)

t.speed(1000)
t.bgcolor("black")
for i in range(6000):
    t.goto(hearta(i)*20, heartb(i)*20)
    for j in range(5):
        t.color("#f73487")
    t.goto(0,0)
t.done()