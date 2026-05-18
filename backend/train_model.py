import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib


df = pd.read_csv("dataset.csv", header=None)

# Features و Labels
X = df.iloc[:, :-1]
y = df.iloc[:, -1]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


model = RandomForestClassifier()


model.fit(X_train, y_train)


accuracy = model.score(X_test, y_test)

print("Accuracy:", accuracy)


joblib.dump(model, "gesture_model.pkl")

print("Model saved!")