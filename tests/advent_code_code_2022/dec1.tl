;; AOC 2022
;; Day1
(def! input (trim (slurp "/Users/jayeshb/Downloads/input.txt")))
(def! inp-list (split input "\n\n"))
(def! max-cal 0)
(def! max (fn* (l) (reduce (fn* (a b) (if (and (number? b) (> a b)) a b)) l 0)))
(def! get-cal (fn* (a) (reduce + (map toInt (split a "\n")) 0)))
(def! cals (map get-cal inp-list))

