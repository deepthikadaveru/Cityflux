from backend.trajectory_engine import reconstruct_trajectory
import json

res = reconstruct_trajectory("TS 07 EA 9012")
print(json.dumps(res, indent=2))
