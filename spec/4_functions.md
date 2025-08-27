Template for “Formal-ish Pseudo Code” for LLMs
# ==============================================
# FUNCTION: <function_name>
# INPUT: <describe inputs, types, constraints>
# OUTPUT: <describe outputs, types, constraints>
# INVARIANTS: <properties that must always hold during execution>
# PRECONDITIONS: <conditions that must be true before execution>
# POSTCONDITIONS: <conditions that must be true after execution>
# EDGE CASES: <special inputs or situations>
# ==============================================

function select_day(today):

    when select_day button is activated:
        check the todays date
        find the current date in the calendar
        place the day_overlay
    end select_day activated

    when select_day button is deactivated:
        remove the day_overlay
    end select day deactivated


function select_week(week_number):

    when select_week button is activated: 
    	find the weeknumber
    	find the monday (ma)
    	select monday (ma) through friday (vr)
    	place the week_overlay
    end select_week activated

    when select_week button is deactivated:
	    remove the week_overlay
    end select_week deactivated
    

function select_month(month_number)

    when the select_month button is activated:
        find the month
        consider the number of days in the month
        select all the cells in the month
        place month_overlay
    end select_month activated

    when select_month deactivated:
        move select_month overlay
    end select_month deactivated



    # Optional: assertions (LLM can turn into code checks)
    assert <invariant or property>
    return <outputs>


Notes for LLM usage:

• Keep each step explicit.
• Include invariants as comments or assertions — LLM can implement them in code.
• Use natural-language phrases for operations (sort, swap, filter, map) to keep it language-agnostic.
• Iteratively refine: pseudo code → LLM code → review → refine pseudo code.
