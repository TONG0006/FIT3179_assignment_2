    print(
        chess_ratings[
            (chess_ratings["month"] == 1)
            & (chess_ratings["rating_standard"] != "")
            & (chess_ratings["rating_standard"].notnull())
        ]
    )