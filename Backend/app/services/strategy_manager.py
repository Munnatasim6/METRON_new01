import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("StrategyManager")

class StrategyManager:
    def __init__(self):
        # 6 Modes: Conservative, Balanced, Aggressive, AI-Adaptive, Scalper Pro, Swing Master, Snipe Hunter, Trend Surfer
        # Storing current strategy mode (Default: Balanced)
        self.current_mode = "Balanced"
        
        # Strategy Configurations
        self.strategies = {
            "Conservative": {
                "min_score": 6,
                "allowed_phases": ["Markup", "Accumulation"],
                "risk_tolerance": "Low",
                "description": "Only takes strong signals in favorable market phases."
            },
            "Balanced": {
                "min_score": 4,
                "allowed_phases": ["Markup", "Accumulation", "Consolidation"],
                "risk_tolerance": "Medium",
                "description": "Takes standard signals with moderate risk."
            },
            "Aggressive": {
                "min_score": 2,
                "allowed_phases": ["ALL"],
                "risk_tolerance": "High",
                "description": "Takes any positive signal."
            },
            "Ultra-Safe": {
                "min_score": 8,
                "allowed_phases": ["Markup"],
                "risk_tolerance": "Very Low",
                "description": "Capital protection priority. Only perfection."
            },
             "Scalper Pro": {
                "min_score": 3,
                "allowed_phases": ["ALL"],
                "risk_tolerance": "Medium-High",
                "special_logic": "Quick_Profits",
                "description": "Designed for fast entries on lower timeframes."
            },
            "Swing Master": {
                "min_score": 5,
                "allowed_phases": ["Accumulation", "Markup"],
                "risk_tolerance": "Medium",
                "special_logic": "Trend_Following",
                "description": "Captures larger moves on higher timeframes."
            },
            "Snipe Hunter": {
                "min_score": 4,
                "allowed_phases": ["Distribution", "Accumulation"], # Reversal Zones
                "risk_tolerance": "High",
                "special_logic": "Reversal_Hunter",
                "description": "Targets bottoms and tops (Reversals)."
            },
             "Trend Surfer": {
                "min_score": 4,
                "allowed_phases": ["Markup", "Markdown"], # Only Trending Phases
                "risk_tolerance": "Medium",
                "special_logic": "Trend_Only",
                "description": "Strictly follows the trend direction."
            }
        }

    def set_mode(self, mode_name):
        """
        Dynamically changes the strategy mode.
        """
        if mode_name in self.strategies or mode_name == "AI-Adaptive":
            self.current_mode = mode_name
            logger.info(f"🔄 Strategy Mode Changed to: {mode_name}")
            return True, f"Strategy updated to {mode_name}"
        else:
            return False, "Invalid Strategy Mode"

    def get_strategy_decision(self, sentiment_result, market_phase):
        """
        Evaluates the signal based on the current active strategy.
        """
        score = sentiment_result.get('score', 0)
        verdict = sentiment_result.get('verdict', 'NEUTRAL')
        
        # Handle AI-Adaptive Mode Logic
        active_mode = self.current_mode
        if self.current_mode == "AI-Adaptive":
            active_mode = self._resolve_ai_mode(market_phase, score)
            
        config = self.strategies.get(active_mode, self.strategies["Balanced"])
        
        # Decision Logic
        should_trade = False
        reason = ""

        # Check Phase
        if "ALL" in config["allowed_phases"] or market_phase in config["allowed_phases"]:
            # Check Score
            if abs(score) >= config["min_score"]:
                should_trade = True
                reason = f"Score {score} meets threshold {config['min_score']} for {active_mode}"
            else:
                 reason = f"Score {score} too low for {active_mode} (Min: {config['min_score']})"
        else:
            reason = f"Market Phase '{market_phase}' is not allowed in {active_mode}"

        # Special Logic Handling
        special = config.get("special_logic")
        if special == "Trend_Only":
            # If Trend Surfer, only trade if score matches phase direction
            if market_phase == "Markup" and score < 0: should_trade = False # Don't Short in Markup
            if market_phase == "Markdown" and score > 0: should_trade = False # Don't Buy in Markdown
            
        elif special == "Reversal_Hunter":
            # Snipe Hunter prefers range extremes (Accumulation/Distribution)
            pass 

        return {
            "strategy": active_mode,
            "should_trade": should_trade,
            "reason": reason,
            "final_verdict": verdict if should_trade else "WAIT ✋"
        }

    def _resolve_ai_mode(self, phase, score):
        """
        AI Logic to select the best mode based on market conditions.
        """
        if phase == "Consolidation":
            return "Scalper Pro" # Chop market -> Scalp
        elif phase == "Markup" or phase == "Markdown":
            return "Trend Surfer" # Strong trend -> Ride it
        elif phase == "Distribution" or phase == "Accumulation":
            return "Snipe Hunter" # Reversal zones
        else:
            return "Balanced" # Default

strategy_manager = StrategyManager()
