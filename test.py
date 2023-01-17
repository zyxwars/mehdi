sum = 0

for i in range(1, 12):
    print(i, sum)
    sum += 2**(i - 1) 

print(sum)
