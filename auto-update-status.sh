#!/bin/bash

# Script para atualizar STATUS.md automaticamente a cada 15 minutos
# Uso: ./auto-update-status.sh

echo "🚀 Iniciando auto-atualização do STATUS.md (a cada 15 minutos)"
echo "⏹️  Pressione Ctrl+C para parar"
echo ""

while true; do
  echo "⏰ $(date '+%Y-%m-%d %H:%M:%S') - Atualizando STATUS.md..."
  node update-status.js
  echo "⏸️  Aguardando 15 minutos..."
  echo ""
  sleep 900  # 900 segundos = 15 minutos
done
