#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys, getopt
import pcbnew
"""
This program runs pcbnew and imports a Specctra SES file, then saves the result
as a new KiCad PCB. 
"""

def main(argv):
  board_file = ''
  output_file = ''
  session_file = ''
  try:
    opts, args = getopt.getopt(argv, "hb:s:o:",["board=","session=","output="])
  except getopt.GetoptError:
    print ('import_ses.py -b <board_file> -s <session_file> -o <output_file>')
    sys.exit(2)
  for opt, arg in opts:
    if opt == '-h': 
      print ('import_ses.py -b <board_file> -s <session_file> -o <output_file>')
      sys.exit()
    elif opt in ("-b", "--board"):
      board_file = arg
    elif opt in ("-s", "--session"):
      session_file = arg
    elif opt in ("-o", "--output"):
      output_file = arg
  print('Importing Specctra SES ', session_file,' for ', board_file)
  board = pcbnew.LoadBoard(board_file)
  pcbnew.ImportSpecctraSES(board, session_file)
  success = pcbnew.SaveBoard(output_file, board, False)
  if success:
    print('Saved output to ', output_file)
  else:
    print('Couldn\'t save output to ', output_file)

if __name__ == "__main__":
   main(sys.argv[1:])
