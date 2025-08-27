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

for all functions:
    read the settings file.
    assing startWeek, endWeek to each sprint


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
    

function select_sprint(sprintNumber, startWeek, endWeek)

    when the select_sprint button is activated:
        determine the sprintNumber
        find the startWeek
        find the endWeek
        select all cells: startWeek-endWeek
        place sprintNumber_overley
    end select_sprint1 activated

    when select_sprint deactivated:
        move select_sprintNumber overlay
    end select_sprint deactivated


    # Optional: assertions (LLM can turn into code checks)
    assert <invariant or property>
    return <outputs>


Notes for LLM usage:

• Keep each step explicit.
• Include invariants as comments or assertions — LLM can implement them in code.
• Use natural-language phrases for operations (sort, swap, filter, map) to keep it language-agnostic.
• Iteratively refine: pseudo code → LLM code → review → refine pseudo code.
