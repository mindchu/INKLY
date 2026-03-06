import csv
import os

class TestReporter:
    def __init__(self, filename="results.csv"):
        # Put results.csv in the test directory
        self.filename = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), filename)
        self.results = []
    
    def add_result(self, tc_id, name, status, message=""):
        self.results.append({
            "TC ID": tc_id,
            "Test Name": name,
            "Status": status,
            "Message": message
        })
        print(f"[{status}] {tc_id}: {name} - {message}")
        
    def generate_report(self):
        print("\n" + "="*85)
        print("                             TEST EXECUTION REPORT")
        print("="*85)
        fmt_str = "| {:<12} | {:<30} | {:<6} | {:<25} |"
        
        print(fmt_str.format("TC ID", "Test Name", "Status", "Message"))
        print("-" * 85)
        
        for r in self.results:
            msg = r['Message']
            msg_cut = msg[:22] + "..." if len(msg) > 25 else msg
            name = r['Test Name']
            name_cut = name[:27] + "..." if len(name) > 30 else name
            print(fmt_str.format(r['TC ID'], name_cut, r['Status'], msg_cut))
            
        print("="*85 + "\n")
        
        try:
            with open(self.filename, mode='w', newline='', encoding='utf-8') as file:
                writer = csv.DictWriter(file, fieldnames=["TC ID", "Test Name", "Status", "Message"])
                writer.writeheader()
                writer.writerows(self.results)
            print(f"[Info] Results saved to {self.filename}")
        except Exception as e:
            print(f"[Error] Could not save to {self.filename}: {e}")
