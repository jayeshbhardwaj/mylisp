;; PART 1
(def! input (trim (slurp "/Users/jayeshb/Downloads/input_day2.txt")))
(def! inp-list (split input "\n"))
(def! points {"X" 1 "Y" 2 "Z" 3})
(def! moves {"A" "Y" "B" "Z" "C" "X"})
(def! draw {"A" "X" "B" "Y" "C" "Z"})

(def! fnc (fn* (s)
                (let* (fi (first (split s " ")) se (first (rest (split s " "))))
                (if (= se (get moves fi))
                    (+ 6 (get points se))
                    (if (= se (get draw fi)) (+ 3 (get points se)) (get points se))
                ))))

(def! out (map fnc inp-list))
(prn (reduce + out 0))
;;; PART 2
(def! loss {"A" "Z" "B" "X" "C" "Y"})
(def! fnc (fn* (s)
                (let* (fi (first (split s " ")) se (first (rest (split s " "))))
                (if (= se "Z")
                    (+ 6 (get points (get moves fi)))
                    (if (= se "Y")
                        (+ 3 (get points (get draw fi)))
                        (get points (get loss fi))
                    )))))

(def! out (map fnc inp-list))
(prn (reduce + out 0))