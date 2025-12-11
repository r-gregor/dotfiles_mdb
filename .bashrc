# If not running interactively, don't do anything
case $- in
    *i*) ;;
      *) return;;
esac

shopt -s histappend
shopt -s checkwinsize
shopt -s direxpand # 20250220
shopt -s globstar  # 20251211

HISTCONTROL=ignoreboth
HISTSIZE=10000
HISTFILESIZE=2000

export PROMPT_DIRTRIM=3


[ -x /usr/bin/lesspipe ] && eval "$(SHELL=/bin/sh lesspipe)"

case "$TERM" in
    xterm-color|*-256color) color_prompt=yes;;
esac

if [ -n "$force_color_prompt" ]; then
    if [ -x /usr/bin/tput ] && tput setaf 1 >&/dev/null; then
        color_prompt=yes
    else
        color_prompt=
    fi
fi

unset color_prompt force_color_prompt


if [ -x /usr/bin/dircolors ]; then
    test -r ~/.dircolors && eval "$(dircolors -b ~/.dircolors)" || eval "$(dircolors -b)"
fi


if [ -f ~/.bash_aliases ]; then
    . ~/.bash_aliases
fi

if ! shopt -oq posix; then
  if [ -f /usr/share/bash-completion/bash_completion ]; then
    . /usr/share/bash-completion/bash_completion
  elif [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
  fi
fi

# SOURCES ...
source $HOME/majstaf/majrcs/bashrc-muadib
source $HOME/majstaf/majrcs/aliases-muadib
# source $HOME/majstaf/majrcs/aliases-muadib-fish
source $HOME/majstaf/majrcs/barve
source $HOME/majstaf/majrcs/funclist
source $HOME/majstaf/majrcs/peesena
source $HOME/majstaf/majrcs/vars-muadib
source $HOME/majstaf/majrcs/xcol_bash.sh

. "$HOME/.cargo/env"
source /home/rgregor/.config/alacritty/extra/completions/alacritty.bash

# eval "$(starship init bash)"

#20250425
eval "$(zoxide init bash)"

export MDBGIT_STATUS_REPORTS="${HOME}/.tmp/MDBGIT_STATUS_REPORTS"
export MDBGIT_TPUSH_REPORTS="${HOME}/.tmp/MDBGIT_TPUSH_REPORTS"
export TESTING_STATUS_REPORTS="${HOME}/.tmp/TESTING_STATUS_REPORTS"
export TESTING_TPUSH_REPORTS="${HOME}/.tmp/TESTING_TPUSH_REPORTS"

