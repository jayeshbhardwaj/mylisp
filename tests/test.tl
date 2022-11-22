;; First TLisp program
;; To run -> (load-file "/Users/jayeshb/workspaces/mal-ts/tests/test.tl")
(list + 1 2)
(def! a 2)
(prn "hello world")
(:b {:b 1})
(def! b 3)
(def! inc4 (fn* (a) (+ 4 a)))

(prn (inc4 5))